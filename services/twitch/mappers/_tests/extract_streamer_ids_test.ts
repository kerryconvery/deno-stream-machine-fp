import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { extractStreamerIds } from "../extract_streamer_ids.ts";
import { PlatformStream } from "../../../../shared/types.ts";

Deno.test("Extract user ids", async (test) => {
  await test.step("Given a list of twitch streams it returns a list of user ids", () => {
    const platformStreams = [
      createPlatformStream('God of war', '123'),
      createPlatformStream('Dark souls', '456'),
    ]

    const userIds = extractStreamerIds(platformStreams);

    assertEquals(userIds, ['123', '456'])
  })

  await test.step("Given an empty list of twitch streams it returns an empty list of user ids", () => {
    assertEquals(extractStreamerIds([]), [])
  });
  
  function createPlatformStream(title: string, userId: string): PlatformStream {
    return {
      id: '',
      title,
      url: '',
      streamer: {
        id: userId,
        name: '',
        avatarUrl: '',
      },
      thumbnailUrl: '',
      views: 0,
      isLive: true,
    }
  }
})