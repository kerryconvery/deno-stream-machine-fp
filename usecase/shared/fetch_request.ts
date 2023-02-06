import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { removeNoneParams } from "./fp_utils.ts";

export type RequestMethod = 'GET' | 'POST'

type InvokeParams = {
  method: RequestMethod,
  headers: O.Option<Record<string, string>>,
  body: O.Option<string>,
}

export type RequestParams = InvokeParams & {
  url: string,
  queryParams: O.Option<Record<string, unknown>>,
}

export abstract class RequestResponse {}

export class RequestSuccess extends RequestResponse {
  constructor(private data: unknown) {
    super()
  }

  getData(): unknown {
    return this.data
  }
}

class HttpError extends Error {
  constructor(private status: number, message: string) {
    super(message)
  }

  getStatus(): number {
    return this.status
  }
}

export class RequestFailure extends RequestResponse {}

export class UnauthorizedRequest extends RequestFailure {}

export class ResourceNotFound extends RequestFailure {}

export class UnsupportedError extends RequestFailure {}

export const fetchRequest = (
  fetch: (url: string, init: RequestInit) => Promise<Response>
) => (
  params: RequestParams
): TE.TaskEither<RequestFailure, RequestSuccess> => {
   return pipe(
      O.Do,
      O.bind("method", () => O.some(params.method)),
      O.bind("headers", () => O.some(params.headers)),
      O.bind("body", () => O.some(params.body)),
      TE.fromOption(() => TE.left),
      TE.chain((requestInit) => pipe(
        TE.Do,
        TE.bind("url", () => TE.right(buildUrl(params.url, params.queryParams))),
        TE.chain(({ url }) => invokeRequest(fetch, url, requestInit))
      ))
   )
}

function buildUrl(url: string, queryParams: O.Option<Record<string, unknown>>): string {
  return pipe(
    queryParams,
    O.fold(
      () => url,
      (queryParams) => `${url}?${joinQueryParams(queryParams)}`
    )
  )
}

function joinQueryParams(queryParams: Record<string, unknown>): string {
  return Object.entries(queryParams).map(([key, value]) => `${key}=${value}`).join('&')
}

function invokeRequest(
  fetch: (url: string, options: RequestInit) => Promise<Response>,
  url: string,
  invokeParams: InvokeParams,
): TE.TaskEither<RequestFailure, RequestSuccess> {
  return TE.tryCatch(
    async () => {
      const response = await fetch(url, toRequestInit(invokeParams));

      if (response.status >= 400) {
        return Promise.reject(new HttpError(response.status, "Error"))
      }

      return  getSuccessResponse(response)
    },
    (error) => getFailedResponse(error)
  )
}

function toRequestInit(invokeParams: InvokeParams): RequestInit {
  return pipe(
    {
      headers: invokeParams.headers,
      body: invokeParams.body,  
    },
    removeNoneParams,
    O.match(
      () => ({ method: invokeParams.method }),
      (params) => ({ method: invokeParams.method, ...params })   
    )
  )
}

function getFailedResponse(error: unknown): RequestFailure {
  if (error instanceof HttpError) {
    return statusCodeToFailedResponse((error as HttpError).getStatus())
  }
  
  return new UnsupportedError()
}

function statusCodeToFailedResponse(statusCode: number): RequestFailure {
  if (statusCode === 401) {
    return new UnauthorizedRequest()
  }

  if (statusCode === 404) {
    return new ResourceNotFound()
  }

  return new UnsupportedError()
}


async function getSuccessResponse<T>(response: Response): Promise<RequestSuccess> {
  const data = await response.json()
    
  return new RequestSuccess(data)
}