import { fork } from "/usecase/shared/functors/fork.ts";
import { Option } from "/usecase/shared/functors/option.ts";

export type RestClientConfig = {
  apiUrl: string,
  params: Option<Record<string, string>>,
}

export type RequestOptions = {
  method: string,
  headers: Record<string, string>,
  body?: string
}

export type RequestMethod = 'GET' | 'POST'

export type RequestParams = {
  url: string,
  method: RequestMethod,
  headers: Record<string, string>,
  body?: string
}
export function request<T>({ url, method, headers, body }: RequestParams): Promise<T> {
  return fetch(url, {
    method,
    headers,
    body
  })
  .then((response) => {
    return getJsonResponse(response)
  })
  .then((json) => {
    return json as T
  })
}

function getJsonResponse(response: Response): Promise<unknown> {
  return fork({
    condition: response.ok,
    left: () => Promise.reject(response),
    right: () => response.json()
   })
}
