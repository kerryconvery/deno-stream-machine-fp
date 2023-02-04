import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import * as OP from "/usecase/shared/fp/optional_param.ts";
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
          params,
          includeAuthorisationHeaders(clientId, token.getAccessToken()),
          request
        )
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