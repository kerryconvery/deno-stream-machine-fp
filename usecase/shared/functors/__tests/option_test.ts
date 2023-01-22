import { assertInstanceOf, assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Option,None,Some } from "../option.ts";

Deno.test("Option monad", async (test) =>{
  await test.step("Given a non null or undefined value it will return Some", () => {
    const some = Option<string>.of("some");

    assertInstanceOf(some, Some<string>);
  })

  await test.step("Given a null or undefined value it will return None", () => {
    const none = Option<string>.of();

    assertInstanceOf(none, None<string>);
  })

  await test.step("Given a mapper it will apply the mapper and return Some", () => {
    const some = Option<string>
      .of("some")
      .map((_input: string) => "new some")

    assertInstanceOf(some, Some<string>);
    assertEquals(some.getValue(), "new some")
  })

  await test.step("Given an async mapper it will apply the mapper and return Some", async () => {
    const some = await Option<string>
      .of("some")
      .mapAsync((_input: string) => Promise.resolve("new some"))

    
    assertInstanceOf(some, Some<string>);
    assertEquals(some.getValue(), "new some")
  })

  await test.step("Given a mapper it will apply the mapper and return None", () => {
    const none = Option<string>
      .of("some")
      .map((_input: string) => undefined)

    assertInstanceOf(none, None<string>);
    assertEquals(none.getValue("none"), "none")
  })

  await test.step("Given an async mapper it will apply the mapper and return None", async () => {
    const none = await Option<string>
      .of("some")
      .mapAsync((_input: string) => Promise.resolve(undefined))

    assertInstanceOf(none, None<string>);
    assertEquals(none.getValue("none"), "none")
  })

  await test.step("Given a right handler it will apply the handler when the option is some", () => {
    const some = Option
     .Some<string>("some")
     .getValueAs((value: string) => value, () => "none")

     assertEquals(some, "some");
  })

  await test.step("Given a right handler it will apply the handler when the option is some", () => {
    const some = Option
     .None<string>()
     .getValueAs<string>((value: string) => value, () => "none")

     assertEquals(some, "none");
  })
})
