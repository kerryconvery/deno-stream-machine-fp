import { assertInstanceOf, assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Maybe,None,Some } from "../maybe.ts";

Deno.test("Maybe monad", async (test) =>{
  await test.step("Given a non null or undefined value it will return Some", () => {
    const some = Maybe<string>.toMaybe("some");

    assertInstanceOf(some, Some<string>);
  })

  await test.step("Given a null or undefined value it will return None", () => {
    const none = Maybe<string>.toMaybe();

    assertInstanceOf(none, None<string>);
  })

  await test.step("Given a mapper it will apply the mapper and return Some", () => {
    const some = Maybe<string>
      .toMaybe("some")
      .map((_input: string) => "new some")

    assertInstanceOf(some, Some<string>);
    assertEquals(some.getValue(), "new some")
  })

  await test.step("Given a mapper it will apply the mapper and return None", () => {
    const none = Maybe<string>
      .toMaybe("some")
      .map((_input: string) => undefined)

    assertInstanceOf(none, None<string>);
    assertEquals(none.getValue("none"), "none")
  })

  await test.step("Given a right handler it will apply the handler when the maybe is some", () => {
    const some = Maybe
     .Some<string>("some")
     .getValueAs((value: string) => value, () => "none")

     assertEquals(some, "some");
  })

  await test.step("Given a right handler it will apply the handler when the maybe is some", () => {
    const some = Maybe
     .None<string>()
     .getValueAs<string>((value: string) => value, () => "none")

     assertEquals(some, "none");
  })
})
