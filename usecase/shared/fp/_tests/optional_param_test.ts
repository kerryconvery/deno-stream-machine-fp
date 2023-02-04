import { assertEquals } from 'https://deno.land/std@0.152.0/testing/asserts.ts'
import * as O from "https://esm.sh/fp-ts@2.13.1/Option"
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { assertSpyCall, assertSpyCalls, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as OP from '../optional_param.ts'

Deno.test("Option Param", async (test) => {
  await test.step("Given none it will return a none param", () => {
    const none = OP.none;

    assertEquals(OP.isNone(none), true);
    assertEquals(OP.isSome(none), false);
  })

  await test.step("Given some it will return a some param", () => {
    const some = OP.some("some");

    assertEquals(OP.isSome(some), true);
    assertEquals(OP.isNone(some), false);
  })

  await test.step("Given of some it will return a some param", () => {
    const some = OP.of(1)

    assertEquals(OP.isSome(some), true);
  })

  await test.step("Given Do it will return none", () => {
    const none = OP.Do;

    assertEquals(OP.isNone(none), true);
  })

  await test.step("When binding a some it will accumulate", () => {
    const some = pipe(
      OP.Do,
      OP.bind("a", () => OP.some(1)),
      OP.bind("b", () => OP.some(2)),
      OP.getOrElse<Record<string, unknown>>(() => ({ a: 0, b: 0 }))
    );

    assertEquals(some, { a: 1, b: 2 })
  })

  await test.step("When binding a none it will not accumulate but still be a some", () => {
    const some = pipe(
      OP.Do,
      OP.bind("a", () => OP.some(1)),
      OP.bind("b", () => OP.none),
      OP.getOrElse<Record<string, unknown>>(() => ({ a: 0, b: 0 }))
    );

    assertEquals(some, { a: 1 })
  })

  await test.step("Given none it will run left", () => {
    const none = OP.none;
    const value = OP.match(
      () => 1,
      () => 2
    )(none)

    assertEquals(value, 1)
  })

  await test.step("Give some it will run right", () => {
    const some = OP.some(2);
    const value = OP.match(
      () => 1,
      (value: number) => value
    )(some)

    assertEquals(value, 2)
  })

  await test.step("Given none it will not map", () => {
    const none = OP.none;
    const mapper = spy(() => 1)

    OP.map(mapper)(none)

    assertSpyCalls(mapper, 0)
  })

  await test.step("Given some it will map and return the value", () => {
    const mapper = spy((value: number) => 1 + value)

    const result = pipe(
      OP.some(1),
      OP.map(mapper),
      OP.getOrElse(() => 0)
    )

    assertSpyCall(mapper, 0, { args: [1] })
    assertEquals(result, 2);
  })

  await test.step("It will return an option some", () => {
    const some = pipe(
      OP.of(1),
      OP.toOption,
    )

    assertEquals(O.isSome(some), true);
  })

  await test.step("It will return an option none", () => {
    const none = pipe(
      OP.none,
      OP.toOption,
    )

    assertEquals(O.isNone(none), true);
  })
})