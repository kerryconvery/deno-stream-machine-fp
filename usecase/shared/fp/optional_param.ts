import * as O from "https://esm.sh/fp-ts@2.13.1/Option";

export type OptionalParam<A> = O.Option<A>;

export function of<A>(value: A): OptionalParam<A> {
  return O.of(value);
}

export const none: OptionalParam<never> = O.none as OptionalParam<never>

export function isNone(paramOption: OptionalParam<unknown>): boolean {
  return O.isNone(paramOption)
}

export function some<A>(value: A): OptionalParam<A> {
  return O.some(value);
}

export function isSome<A>(paramOption: OptionalParam<A>): boolean {
  return O.isSome(paramOption);
}

export function match<A, B>(onNone: () => B, onSome: (value: A) => B) {
  return (paramOption: OptionalParam<A>): B => {
    return O.match<A, B>(onNone, onSome)(paramOption);
  }
}

export function map<A, B>(mapper: (a: A) => B) {
  return (paramOption: OptionalParam<A>): OptionalParam<B> => {
    return O.map(mapper)(paramOption);
  }
}

export function getOrElse<A>(onNone: () => A) {
  return (paramOption: OptionalParam<A>): A => {
    return O.getOrElse(onNone)(paramOption);
  }
}

export const Do: OptionalParam<Record<string, unknown>> = none;

export function bind<A, B>(name: string, getValue: () => OptionalParam<B>) {
  return (accOptions: OptionalParam<Record<string, unknown>>): OptionalParam<Record<string, unknown>> => {
    const value = getValue();

    if (isNone(value)) {
      return accOptions;
    }

    const bound = O.bind(name, () => value)(isSome(accOptions) ? accOptions : of({}))

    return bound as OptionalParam<Record<string, unknown>>
  }
}

