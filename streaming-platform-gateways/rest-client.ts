import { fork } from "../shared/functors/fork.ts";
import { Maybe } from "../shared/functors/maybe.ts";

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
  method: string,
  headers: Record<string, string>,
  body?: string
}

export class Request {
  private url: string;
  private method: string;

  private headers: Record<string, string> = {}
  private body?: string;
  
  constructor(url: string, method: string) {
    this.url = url;
    this.method = method;
  }

  static createGetRequest<T>(url: string): Request {
    return new Request(url, "GET");
  }

  static createPostRequest<T>(url: string): Request {
    return new Request(url, "POST");
  }

  setBody(body: string): Request {
    this.body =body;
    return this;
  }

  setHeader(name: string, value: string): Request {
    this.headers[name] = value;
    return this;
  }

  setHeaders(headers: Record<string, string>): Request {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  request<T>(): Promise<T> {
    return  fetch(
      this.url,
      this.getRequestOptions()
    )
    .then((response) => {
      return fork({
        condition: response.ok,
        left: () => Promise.reject(response),
        right: () => response.json()
       })
    })
    .then((json) => {
      return json as T
    });
  }

  private getRequestOptions(): RequestOptions {
    return {
      method: this.method,
      headers: this.headers,
      body: this.body
    }
  }
}

const _makeUrl = (url: string, urlParams: Record<string, string>): string => {
  const params = Object.entries(urlParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${url}?${params}`;
}
