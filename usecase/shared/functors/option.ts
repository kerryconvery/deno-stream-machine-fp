import { Selector } from "./types.ts";

export abstract class Option<T> {
  public static toMaybe<T>(value?: T): Option<T> {
    if (value) {
      return new Some(value)
    }
    return new None()
  }
  
  public static Some<T>(value: T): Option<T> {
    return new Some(value);
  }

  public static None<T>(): Option<T> {
    return new None<T>();
  }

  isNone(): boolean {
    return this instanceof None
  }

  isSome(): boolean {
    return this instanceof Some
  }

  abstract map<Result>(mapper: Selector<T, Result>): Option<Result>;
  abstract flatMap<Result>(mapper: Selector<T, Option<Result>>): Option<Result>;
  abstract getValue(fallbackValue: T): T;
  abstract getValueAs<Result>(right: (value: T) => Result, left: () => Result): Result;
}

export class Some<T> extends Option<T> {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value
  }

  map<Result>(mapper: Selector<T,Result>): Option<Result> {
    return Option.toMaybe(mapper(this._value));
  }

  flatMap<Result>(mapper: Selector<T, Option<Result>>): Option<Result> {
    return mapper(this._value);
  }

  getValue(): T {
    return this._value;
  }

  getValueAs<Result>(right: (value: T) => Result, _left: () => Result): Result {
    return right(this._value);
  }
}

export class None<T> extends Option<T> {
  map<Result>(_mapper: Selector<T,Result>): Option<Result> {
    return new None<Result>();
  }

  flatMap<Result>(_mapper: Selector<T,Option<Result>>): Option<Result> {
    return new None<Result>();
  }

  getValue(fallbackValue: T): T {
    return fallbackValue;
  }

  getValueAs<Result>(_right: (value: T) => Result, left: () => Result): Result {
    return left();
  }
}