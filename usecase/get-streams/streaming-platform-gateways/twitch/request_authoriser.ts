
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { RequestFailure, RequestParams, RequestSuccess, RequestMethod } from "../../../shared/fetch_request.ts";

export type TwitchAuthResponse = {
  access_token: string,
  expires_in: number,
  token_type: string,
}

export type TwitchAuthoriserParams = {
  request: (params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>;
  clientId: string;
  clientSecret: string;
  authUrl: string;
}

export class TwitchAuthenticationResult {}

export class TwitchAuthorisationToken extends TwitchAuthenticationResult {
  constructor(private accessToken: string, private expiresIn: number, private tokenType: string) {
    super();
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getExpiresIn(): number {
    return this.expiresIn;
  }

  getTokenType(): string {
    return this.tokenType;
  }
}

export class TwitchAuthenticationFailed extends TwitchAuthenticationResult {}

export const twitchRequestAuthoriser = ({
  authUrl,
  clientId,
  clientSecret,
  request
}: TwitchAuthoriserParams) => (): TE.TaskEither<TwitchAuthenticationFailed, TwitchAuthorisationToken> => {
  return pipe(
    TE.Do,
    TE.bind('url', () => TE.right(`${authUrl}/oauth2/token`)),
    TE.bind('method', () => TE.right('POST' as RequestMethod)),
    TE.bind('headers', () => TE.right(O.some({ 'Content-Type': 'application/x-www-form-urlencoded' }))),
    TE.bind('queryParams', () => TE.right(O.none)),
    TE.bind('body', () => TE.right(O.some(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`))),
    TE.chain((requestParams) => {
      return request(requestParams)
    }),
    TE.map((response: RequestSuccess) => {
      return mapToTwitchAuthoriserResult(response.getData() as TwitchAuthResponse);
    }),
    TE.mapLeft(() => new TwitchAuthenticationFailed()),
  )
}

function mapToTwitchAuthoriserResult(TwitchAuthResponse: TwitchAuthResponse): TwitchAuthorisationToken {
  return new TwitchAuthorisationToken(
    TwitchAuthResponse.access_token,
    TwitchAuthResponse.expires_in,
    TwitchAuthResponse.token_type,
  )
}


