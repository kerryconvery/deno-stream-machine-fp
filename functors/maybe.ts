import { Selector } from "./types.ts";

export abstract class Maybe<T> {
  public static toMaybe<T>(value?: T): Maybe<T> {
    if (value) {
      return new Some(value)
    }
    return new None()
  }
  
  public static Some<T>(value: T): Maybe<T> {
    return new Some(value);
  }

  public static None<T>(): Maybe<T> {
    return new None<T>();
  }

  isNone(): boolean {
    return this instanceof None
  }

  isSome(): boolean {
    return this instanceof Some
  }

  abstract map<Result>(mapper: Selector<T, Result>): Maybe<Result>;
  abstract flatMap<Result>(mapper: Selector<T, Maybe<Result>>): Maybe<Result>;
  abstract getValue(fallbackValue: T): T;
}

export class Some<T> extends Maybe<T> {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value
  }

  map<Result>(mapper: Selector<T,Result>): Maybe<Result> {
    return Maybe.toMaybe(mapper(this._value));
  }

  flatMap<Result>(mapper: Selector<T, Maybe<Result>>): Maybe<Result> {
    return mapper(this._value);
  }

  getValue(): T {
    return this._value;
  }
}

export class None<T> extends Maybe<T> {
  map<Result>(_mapper: Selector<T,Result>): Maybe<Result> {
    return new None<Result>();
  }

  flatMap<Result>(_mapper: Selector<T,Maybe<Result>>): Maybe<Result> {
    return new None<Result>();
  }

  getValue(fallbackValue: T): T {
    return fallbackValue;
  }
}