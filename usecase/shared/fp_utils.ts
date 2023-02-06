import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";
import * as O from "https://esm.sh/v103/fp-ts@2.13.1/lib/Option";
import * as R from "https://esm.sh/v103/fp-ts@2.13.1/lib/Record";

export function removeNoneParams(records: Record<string, O.Option<unknown>>): O.Option<Record<string, unknown>> {
  return pipe(
    records,
    R.filter((param: O.Option<unknown>) => O.isSome(param)),
    R.map((param: O.Option<unknown>) => O.toNullable(param)),
    (params: Record<string, unknown>) => R.isEmpty(params) ? O.none : O.some(params)
  )
}

