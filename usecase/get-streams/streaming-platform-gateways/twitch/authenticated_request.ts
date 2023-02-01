import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { TwitchAuthorisationFailed, TwitchAuthorisationToken } from "./request_authoriser.ts";
import { RequestFailure, RequestParams, RequestSuccess, UnauthorizedRequest } from "../../../shared/fetch_request.ts";

export interface TwitchAuthenticatedRequestParams {
  clientId: string,
  request: (params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>;
  getAccessToken: () => TE.TaskEither<TwitchAuthorisationFailed, TwitchAuthorisationToken>;
}

export const twitchAuthenticatedRequest = ({ clientId, request, getAccessToken }: TwitchAuthenticatedRequestParams) => {
  let cachedToken: O.Option<TwitchAuthorisationToken> = O.none;

  const cacheNewAccessToken = () => {
    return pipe(
      getAccessToken(),
      TE.map((authorisationToken: TwitchAuthorisationToken) => {
        cachedToken = O.some(authorisationToken);
        return authorisationToken
      }),
      TE.mapLeft(() => new UnauthorizedRequest()),
    )
  }

  return (params: RequestParams): TE.TaskEither<RequestFailure, RequestSuccess> => {
    return pipe(
      cachedToken,
      O.match(
        cacheNewAccessToken,
        TE.right
      ),
      TE.chain((token: TwitchAuthorisationToken) => {
        return pipe(
          includeAuthorisationHeaders(clientId, token.getAccessToken(), params),
          request
        )
      }),
    )
  }
}

function includeAuthorisationHeaders(clientId: string, accessToken: string, requestParams: RequestParams): RequestParams {
  return pipe(
    requestParams.headers,
    O.match(
      () => O.some<Record<string, string>>({}),
      () => requestParams.headers,
    ),
    O.map((headers: Record<string, string>) => ({
      ...requestParams,
      headers: O.some({
        ...headers,
        'Client-Id': clientId,
        'Authorization': `Bearer ${accessToken}`,
      })
    })),
    O.getOrElse(() => ({
      ...requestParams,
    }))
  )
}