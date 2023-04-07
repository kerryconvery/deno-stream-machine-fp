import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { RequestFailure, RequestParams, RequestSuccess } from "../../../shared/fetch_request.ts";
import { appendRequestQueryParams } from "../../../shared/fp_utils.ts";

export interface YouTubeAuthorizedRequestParams {
    apiKey: string,
    request: (params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>;
}

export function youtubeAuthorizedRequest({ apiKey, request }: YouTubeAuthorizedRequestParams) {
    return (params: RequestParams): TE.TaskEither<RequestFailure, RequestSuccess> => {
      return pipe(
        params,
        appendRequestQueryParams({ key: apiKey }),
        request
      )
    }
}
