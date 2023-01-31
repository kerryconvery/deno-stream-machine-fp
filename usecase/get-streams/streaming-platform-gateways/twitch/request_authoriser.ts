
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { RequestFailure, RequestParams, RequestSuccess } from "../../../shared/fetch_request.ts";

export type TwitchAuthResponse = {
  access_token: string,
  expires_in: number,
  token_type: string,
}

export type AuthorisationRequestResponse = TE.TaskEither<RequestFailure, RequestSuccess>;

export type TwitchAuthoriserParams = {
  request: (params: RequestParams) => AuthorisationRequestResponse;
  clientId: string;
  clientSecret: string;
  authUrl: string;
}

export class TwitchAuthorisationResult {}

export class TwitchAuthorisationToken extends TwitchAuthorisationResult {
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

export class TwitchAuthorisationFailed extends TwitchAuthorisationResult {}

export const twitchRequestAuthoriser = ({
  authUrl,
  clientId,
  clientSecret,
  request
}: TwitchAuthoriserParams) => (): TE.TaskEither<TwitchAuthorisationFailed, TwitchAuthorisationToken> => {
  const requestParams: RequestParams = {
    url: `${authUrl}/oauth2/token`,
    method: "POST",
    headers: O.some({
       "Content-Type": "application/x-www-form-urlencoded",
    }),
    body: O.some(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`),
  }
  
  return pipe(
    requestParams,
    request,
    TE.map((response: RequestSuccess) => {
      return mapToTwitchAuthoriserResult(response.getData() as TwitchAuthResponse);
    }),
    TE.mapLeft(() => new TwitchAuthorisationFailed()),
  )
}

function mapToTwitchAuthoriserResult(TwitchAuthResponse: TwitchAuthResponse): TwitchAuthorisationToken {
  return new TwitchAuthorisationToken(
    TwitchAuthResponse.access_token,
    TwitchAuthResponse.expires_in,
    TwitchAuthResponse.token_type,
  )
}


