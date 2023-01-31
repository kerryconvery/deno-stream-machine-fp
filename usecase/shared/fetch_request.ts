import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"

export type RequestMethod = 'GET' | 'POST'

export type RequestParams = {
  url: string,
  method: RequestMethod,
  headers: O.Option<Record<string, string>>,
  body: O.Option<string>,
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
) => <T>(
  params: RequestParams
): TE.TaskEither<RequestFailure, RequestSuccess> => {
   return pipe(
      O.Do,
      bind("method", () => O.some(params.method)),
      bind("headers", () => params.headers),
      bind("body", () => params.body),
      O.match(
        () => TE.left(new UnsupportedError()),
        (values) => invokeRequest<T>(fetch, params.url, values)
      )
   )
}

function bind(name: string, binder: () => O.Option<unknown>) {
  return (accOptions: O.Option<Record<string, unknown>>): O.Option<Record<string, unknown>> => pipe(
    binder(),
    O.match(
      () => O.getOrElse<Record<string, unknown>>(() => ({}))(accOptions),
      (value: unknown) => {
        const existingOptions = O.getOrElse<Record<string, unknown>>(() => ({}))(accOptions);
        return { ...existingOptions, [name]: value}
      }
    ),
    O.of
  )
}

function invokeRequest<T>(
  fetch: (url: string, init: RequestInit) => Promise<Response>,
  url: string,
  options: Record<string, unknown>
): TE.TaskEither<RequestFailure, RequestSuccess> {
  return TE.tryCatch(
    async () => {
      const response = await fetch(
        url,
        options
      );

      if (response.status >= 400) {
        return Promise.reject(new HttpError(response.status, "Error"))
      }

      return  getSuccessResponse<T>(response)
    },
    (error) => getFailedResponse(error)
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