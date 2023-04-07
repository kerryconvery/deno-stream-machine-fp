import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";
import * as O from "https://esm.sh/v103/fp-ts@2.13.1/lib/Option";
import * as R from "https://esm.sh/v103/fp-ts@2.13.1/lib/Record";
import { RequestParams } from "./fetch_request.ts";

export function removeNoneParams(records: Record<string, O.Option<unknown>>): O.Option<Record<string, unknown>> {
  return pipe(
    records,
    R.filter((param: O.Option<unknown>) => O.isSome(param)),
    R.map((param: O.Option<unknown>) => O.toNullable(param)),
    (params: Record<string, unknown>) => R.isEmpty(params) ? O.none : O.some(params)
  )
}

export const appendRequestHeaders = (newHeaders: Record<string, string>) => (requestParams: RequestParams): RequestParams => {
  return pipe(
    requestParams.headers,
    O.match(
      () => O.some<Record<string, string>>({}),
      () => requestParams.headers,
    ),
    O.map((headers: Record<string, string>) => ({
      ...headers,
      ...newHeaders
    })),
    O.map((headers: Record<string, string>) => ({
      ...requestParams,
      headers: O.some(headers),
    })),
    O.getOrElse(() => ({
      ...requestParams,
    }))
  )
}

export const appendRequestQueryParams = (newParams: Record<string, string>) => (requestParams: RequestParams): RequestParams => {
  return pipe(
    requestParams.queryParams,
    O.match(
      () => O.some<Record<string, unknown>>({}),
      () => requestParams.queryParams,
    ),
    O.map((params: Record<string, unknown>) => ({
      ...params,
      ...newParams
    })),
    O.map((params: Record<string, unknown>) => ({
      ...requestParams,
      queryParams: O.some(params),
    })),
    O.getOrElse(() => ({
      ...requestParams,
    }))
  )
}
