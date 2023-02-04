import * as O from "https://esm.sh/fp-ts@2.13.1/Option";

export type OptionalParam<A> = O.Option<A>;

export function of<A>(value: A): OptionalParam<A> {
  return O.of(value);
}

export const none: OptionalParam<never> = O.none as OptionalParam<never>

export function isNone(optionalParam: OptionalParam<unknown>): boolean {
  return O.isNone(optionalParam)
}

export function some<A>(value: A): OptionalParam<A> {
  return O.some(value);
}

export function isSome<A>(optionalParam: OptionalParam<A>): boolean {
  return O.isSome(optionalParam);
}

export function match<A, B>(onNone: () => B, onSome: (value: A) => B) {
  return (optionalParam: OptionalParam<A>): B => {
    return O.match<A, B>(onNone, onSome)(optionalParam);
  }
}

export function map<A, B>(mapper: (a: A) => B) {
  return (optionalParam: OptionalParam<A>): OptionalParam<B> => {
    return O.map(mapper)(optionalParam);
  }
}

export function getOrElse<A>(onNone: () => A) {
  return (optionalParam: OptionalParam<A>): A => {
    return O.getOrElse(onNone)(optionalParam);
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

export function toOption<A>(optionalParam: OptionalParam<A>): O.Option<A> {
  return optionalParam;
}