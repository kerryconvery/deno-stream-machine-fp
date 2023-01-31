import {
  assertSpyCall,
  spy,
} from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { getTwitchPlatformStreams, TwitchStreams, TwitchUser } from "../twitch.ts";
import { PlatformStreams } from "../types.ts";

Deno.test("Twitch streams provider", async (test) => {
    const twitchStreams = {
      data: [
        {
          id: 'stream1',
          title: 'God of war',
          user_id: '1',
          user_login: 'streamer1',
          thumbnail_url: 'thumbnail',
          viewer_count: 10,
          isLive: true,
        }
      ],
      pagination: {
        cursor: '3'
      }
    };
  
    const twitchUsers = [
      {
        id: '1',
        display_name: 'streamer1',
        profile_image_url: 'profile_image',
      },
    ];

    const getTwitchStreamsSpy = spy((): TO.TaskOption<TwitchStreams> => TO.some(twitchStreams));
    const getTwitchUsersByIdsSpy = spy((_userIds: string[]): T.Task<TwitchUser[]> => T.of(twitchUsers));
    const mapTwitchStreamsToPlatformStreamsSpy = spy((_streams: TwitchStreams, _streamers: TwitchUser[]): PlatformStreams => ({
      source: '',
      streams: [],
      nextPageOffset: O.none,
    }));
    await test.step('Given a list of twitch streams it will return a list of platform streams', async () => {
      const getTwitchPlatformStreamsTask = getTwitchPlatformStreams({
        getTwitchStreams: getTwitchStreamsSpy,
        getTwitchUsersByIds: getTwitchUsersByIdsSpy,
        mapTwitchStreamsToPlatformStreams: mapTwitchStreamsToPlatformStreamsSpy,
      })();

      await getTwitchPlatformStreamsTask();

      assertSpyCall(getTwitchStreamsSpy, 0,  { args: [{}] });
      assertSpyCall(getTwitchUsersByIdsSpy, 0, { args: [['1']] });
      assertSpyCall(mapTwitchStreamsToPlatformStreamsSpy, 0, { args: [twitchStreams, twitchUsers] });
  });
})