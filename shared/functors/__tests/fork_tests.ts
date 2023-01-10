import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { fork } from "../fork.ts";

Deno.test("Fork", async (test) => {
  await test.step("Given a true condition it will return the right result", () => {
    const result = fork({ condition: true, left: () => 1, right: () => 0 });

    assertEquals(result, 0);
  })

  await test.step("Given a false condition it will return the left result", () => {
    const result = fork({ condition: false, left: () => 1, right: () => 0 });

    assertEquals(result, 1);
  })
})