import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import * as OP from "/usecase/shared/fp/optional_param.ts";
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
        cacheNewAccessToken,
        TE.right
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
      OP.match(
        () => OP.some<Record<string, string>>({}),
        () => requestParams.headers,
      ),
      OP.map((headers: Record<string, string>) => ({
        ...headers,
        'Client-Id': clientId,
        'Authorization': `Bearer ${accessToken}`,
      })),
      OP.map((headers: Record<string, string>) => ({
        ...requestParams,
        headers: OP.some(headers),
      })),
      OP.getOrElse(() => ({
        ...requestParams,
      }))
    )
  }
}