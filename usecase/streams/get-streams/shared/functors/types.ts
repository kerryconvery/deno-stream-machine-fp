export type Selector<T, Result> = (input: T) => Result;

export type Matcher<T, Result> = {
  ok: (input: T) => Result,
  err: (input: unknown) => Result
}

export type OnError<T> = (error: unknown) => T;
