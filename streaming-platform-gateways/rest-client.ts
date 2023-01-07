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

export const get = <T>(url: string): Promise<T> => {
  return  fetch(url, {
    method: "GET",
  })
  .then((response) => response.json())
  .then((json) => json.data as T);
}

const _makeUrl = (url: string, urlParams: Record<string, string>): string => {
  const params = Object.entries(urlParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${url}?${params}`;
}
