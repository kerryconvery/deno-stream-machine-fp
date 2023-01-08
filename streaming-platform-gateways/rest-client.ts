import { Maybe } from "../functors/maybe.ts";

export type RestClientConfig = {
  apiUrl: string,
  params: Maybe<Record<string, string>>,
}

export const withParam = (paramName: string, paramValue: string) => (input: RestClientConfig): RestClientConfig => ({
  ...input,
  params: Maybe.Some({
    ...input.params,
    [paramName]: paramValue
  })
});

type Request = {
  url: string,
  headers: Record<string, string>,
}

type PostRequest = Request & {
  body: string
}

export const get = <T>({ url, headers }: Request): Promise<T> => {
  return  fetch(url, {
    method: "GET",
    headers
  })
  .then((response) => {
    return response.json()
  })
  .then((json) => {
    return json as T
  });
}

export const post = <T>({ url, headers, body}: PostRequest): Promise<T> => {
  return  fetch(url, {
    method: "POST",
    body,
    headers
  })
  .then((response) => {
    return response.json()
  })
  .then((json) => {
    return json as T
  });
}

const _makeUrl = (url: string, urlParams: Record<string, string>): string => {
  const params = Object.entries(urlParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${url}?${params}`;
}
