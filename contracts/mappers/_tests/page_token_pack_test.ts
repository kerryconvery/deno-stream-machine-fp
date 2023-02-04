import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { packPageTokens, unpackPageToken } from "../pack_token_pack.ts";

Deno.test("Page token pack", async (test) => {
  await test.step("Given a packed page token it will unpack it", () => {
    const packedPageToken = "provider1:offset1,provider2:offset2";

    const unpackedPageToken = unpackPageToken(packedPageToken);

    assertEquals(unpackedPageToken, {
      provider1: "offset1",
      provider2: "offset2",
    });
  })

  await test.step("Given an unpacked page token it will pack it", () => {
    const unpackedPageToken = {
      provider1: "offset1",
      provider2: "offset2",
    }

    const packedPageToken = packPageTokens(unpackedPageToken);

    assertEquals(packedPageToken, "provider1:offset1,provider2:offset2");
  })
})