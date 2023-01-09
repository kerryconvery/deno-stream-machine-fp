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

export type RequestOptions = {
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
}

class RequestBuilder {
  private url: string;
  private method: string;
  private headers: Record<string, string> = {}
  private body: Maybe<string> = Maybe.None();
  
  constructor(url: string, method: string) {
    this.url = url;
    this.method = method;
  }

  setBody(body: string): RequestBuilder {
    this.body = Maybe.Some(body);
    return this;
  }

  setHeader(name: string, value: string): RequestBuilder {
    this.headers[name] = value;
    return this;
  }

  setHeaders(headers: Record<string, string>): RequestBuilder {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  build(): RequestOptions {
    return {
      url: this.url,
      headers: this.headers,
      method: this.method,
      body: this.body
        .getValueAs<string | undefined>(
            (value: string) => value,
            () => undefined
          )
    }
  }
}

export function createGetRequest(url: string): RequestBuilder {
  return new RequestBuilder(url, "GET");
}

export function createPostRequest(url: string): RequestBuilder {
  return new RequestBuilder(url, "POST");
}

export const request = <T>({ url, method, headers, body }: RequestOptions): Promise<T> => {
  return  fetch(url, {
    method,
    headers,
    body
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
