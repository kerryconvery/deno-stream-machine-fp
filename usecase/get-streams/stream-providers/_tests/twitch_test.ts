import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { getTwitchPlatformStreams, TwitchCategories, TwitchStreams, TwitchUser } from "../twitch.ts";
import { PlatformStreams } from "../types.ts";
import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";

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

    const twitchCategories = {
      data: [
        { id: 'category-1' },
        { id: 'category-2' },
      ]
    }

    const expectedPlatformStreams = {
      source: '',
      streams: [],
      nextPageOffset: O.none,
    }

    const getStreamsSpy = spy((_categoryIds: string[]): TO.TaskOption<TwitchStreams> => TO.some(twitchStreams));
    const getUsersByIdsSpy = spy((_userIds: string[]): T.Task<TwitchUser[]> => T.of(twitchUsers));
    const mapStreamsToPlatformStreamsSpy = spy((_streams: TwitchStreams, _streamers: TwitchUser[]): PlatformStreams =>  expectedPlatformStreams);
    const searchCategoriesSpy = spy((_searchTerm: string): TO.TaskOption<TwitchCategories> => TO.of(twitchCategories));

    const getTwitchPlatformStreamsTask = getTwitchPlatformStreams({
      getStreams: getStreamsSpy,
      getUsersByIds: getUsersByIdsSpy,
      searchCategories: searchCategoriesSpy,
      mapStreamsToPlatformStreams: mapStreamsToPlatformStreamsSpy,
    })

    await test.step('Given no search term it will return an unfiltered list of streams', async () => {
      await getTwitchPlatformStreamsTask(O.none)()

      assertSpyCalls(searchCategoriesSpy, 0);
      assertSpyCall(getStreamsSpy, 0,  { args: [[]] });
      assertSpyCall(getUsersByIdsSpy, 0, { args: [['1']] });
      assertSpyCall(mapStreamsToPlatformStreamsSpy, 0, { args: [twitchStreams, twitchUsers] });
  });

  await test.step('Given a search term it will return a list of streams that match the search term', async () => {
    await getTwitchPlatformStreamsTask(O.some('search-term'))();

    assertSpyCall(searchCategoriesSpy, 0, { args: ['search-term'] });
    assertSpyCall(getStreamsSpy, 1,  { args: [['category-1', 'category-2']] });
  });

  await test.step('Given a search term it will return a list of streams that match the search term', async () => {
    const platformStreams = await getTwitchPlatformStreamsTask(O.some('search-term'))();

    assertEquals(platformStreams, O.some(expectedPlatformStreams))
  });
})