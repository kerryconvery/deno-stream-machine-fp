import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import * as O from  "https://esm.sh/fp-ts@2.13.1/Option";
import { TwitchAuthenticationFailed, TwitchAuthorisationToken } from "./request_authoriser.ts";
import { RequestFailure, RequestParams, RequestSuccess, UnauthorizedRequest } from "../../../shared/fetch_request.ts";

export interface TwitchAuthenticatedRequestParams {
  clientId: string,
  request: (params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>;
  getAccessToken: () => TE.TaskEither<TwitchAuthenticationFailed, TwitchAuthorisationToken>;
}

export const twitchAuthenticatedRequest = ({ clientId, request, getAccessToken }: TwitchAuthenticatedRequestParams) => {
  let cachedToken: O.Option<TwitchAuthorisationToken> = O.none;

  const setCachedToken = (token: TwitchAuthorisationToken) => {
    cachedToken = O.some(token);
  }

  const getTokenFromCache = () => {
    return cachedToken
  }

  const clearTokenCache = () => {
    cachedToken = O.none;
  }

  const cacheNewAccessToken = () => {
    return pipe(
      getAccessToken(),
      TE.map((authorisationToken: TwitchAuthorisationToken) => {
        setCachedToken(authorisationToken);
        return authorisationToken
      }),
    )
  }

  const tryAuthenticatedRequest = (params: RequestParams): TE.TaskEither<RequestFailure, RequestSuccess> => {
    return pipe(
      getTokenFromCache(),
      O.match(
        () => cacheNewAccessToken(),
        (authorisationToken: TwitchAuthorisationToken) => TE.right(authorisationToken)
      ),
      TE.chain((token: TwitchAuthorisationToken) => {
        return pipe(
          params,
          includeAuthorisationHeaders(clientId, token.getAccessToken()),
          request
        )
      })
    )
  }

  const retryAuthenticatedRequest = (params: RequestParams) => {
    clearTokenCache();

    return tryAuthenticatedRequest(params);
  }

  return (params: RequestParams): TE.TaskEither<RequestFailure, RequestSuccess> => {
    return pipe(
      params,
      tryAuthenticatedRequest,
      TE.orElse((error: RequestFailure) => {
        if (error instanceof UnauthorizedRequest) {
          return retryAuthenticatedRequest(params)
        }
        return TE.left(error);
      }),
    )
  }
}

function includeAuthorisationHeaders(clientId: string, accessToken: string) {
  return (requestParams: RequestParams): RequestParams => {
    return pipe(
      requestParams.headers,
      O.match(
        () => O.some<Record<string, string>>({}),
        () => requestParams.headers,
      ),
      O.map((headers: Record<string, string>) => ({
        ...headers,
        'Client-Id': clientId,
        'Authorization': `Bearer ${accessToken}`,
      })),
      O.map((headers: Record<string, string>) => ({
        ...requestParams,
        headers: O.some(headers),
      })),
      O.getOrElse(() => ({
        ...requestParams,
      }))
    )
  }
}