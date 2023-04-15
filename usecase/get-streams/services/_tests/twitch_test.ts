import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { getTwitchPlatformStreams, PagedTwitchStreams, TwitchCategories, TwitchStreams, TwitchUser } from "../twitch.ts";
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
      ],
      pagination: {
        cursor: 'categories-page-cursor'
      }
    }

    const twitchGames = {
      data: [
        { id: 'category-1' },
        { id: 'category-2' },
      ],
      pagination: {
        cursor: 'games-page-cursor'
      }
    }
    
    const expectedPlatformStreams = {
      source: '',
      streams: [],
      nextPageOffset: O.none,
    }

    await test.step('Given no search term it will return an unfiltered list of streams', async () => {
      const pagedTwitchStreams = {
        streams: twitchStreams.data,
        pagination: twitchGames.pagination
      }

      const {
        searchCategoriesSpy,
        getGamesSpy,
        getStreamsSpy,
        getUsersByIdsSpy,
        mapStreamsToPlatformStreamsSpy,
        getTwitchPlatformStreamsTask
      } = getTwitchPlatformStreamsTaskWithMocks()

      await getTwitchPlatformStreamsTask(O.none)()

      assertSpyCalls(searchCategoriesSpy, 0);
      assertSpyCall(getGamesSpy, 0, { args: []});
      assertSpyCall(getStreamsSpy, 0,  { args: [['category-1', 'category-2']] });
      assertSpyCall(getUsersByIdsSpy, 0, { args: [['1']] });
      assertSpyCall(mapStreamsToPlatformStreamsSpy, 0, { args: [pagedTwitchStreams, twitchUsers] });
  });

  await test.step('Given a search term it will return a list of streams that match the search term', async () => {
    const pagedTwitchStreams = {
      streams: twitchStreams.data,
      pagination: twitchCategories.pagination
    }

    const {
      searchCategoriesSpy,
      getGamesSpy,
      getStreamsSpy,
      getUsersByIdsSpy,
      mapStreamsToPlatformStreamsSpy,
      getTwitchPlatformStreamsTask
    } = getTwitchPlatformStreamsTaskWithMocks()

    const platformStreams = await getTwitchPlatformStreamsTask(O.some('search-term'))();

    assertSpyCalls(getGamesSpy, 0);
    assertSpyCall(searchCategoriesSpy, 0, { args: ['search-term'] });
    assertSpyCall(getStreamsSpy, 0,  { args: [['category-1', 'category-2']] });
    assertSpyCall(getUsersByIdsSpy, 0, { args: [['1']] });
    assertSpyCall(mapStreamsToPlatformStreamsSpy, 0, { args: [pagedTwitchStreams, twitchUsers] });
    assertEquals(platformStreams, O.some(expectedPlatformStreams))
  });

  await test.step('Given a search term it will return not try to get streams if no categories were found', async () => {
    const {
      searchCategoriesSpy,
      getGamesSpy,
      getStreamsSpy,
      getUsersByIdsSpy,
      mapStreamsToPlatformStreamsSpy,
      getTwitchPlatformStreamsTask
    } = getTwitchPlatformStreamsTaskWithMocks({ categories : { data: [], pagination: {} }})

    const platformStreams = await getTwitchPlatformStreamsTask(O.some('search-term'))();

    assertSpyCalls(getGamesSpy, 0);
    assertSpyCall(searchCategoriesSpy, 0, { args: ['search-term'] });
    assertSpyCalls(getStreamsSpy, 0);
    assertSpyCalls(getUsersByIdsSpy, 0);
    assertSpyCalls(mapStreamsToPlatformStreamsSpy, 0);
    assertEquals(platformStreams, O.none)
  });

  function getTwitchPlatformStreamsTaskWithMocks(overrides?: { categories?: TwitchCategories }) {
    const getStreamsSpy = spy((_categoryIds: string[]): TO.TaskOption<TwitchStreams> => TO.some(twitchStreams));
    const getGamesSpy = spy((): TO.TaskOption<TwitchCategories> => TO.some(twitchGames));
    const getUsersByIdsSpy = spy((_userIds: string[]): T.Task<TwitchUser[]> => T.of(twitchUsers));
    const mapStreamsToPlatformStreamsSpy = spy((_streams: PagedTwitchStreams, _streamers: TwitchUser[]): PlatformStreams =>  expectedPlatformStreams);
    const searchCategoriesSpy = spy((_searchTerm: string): TO.TaskOption<TwitchCategories> => TO.of(overrides?.categories ?? twitchCategories));

    const getTwitchPlatformStreamsTask = getTwitchPlatformStreams({
      getCategories: getGamesSpy,
      getStreams: getStreamsSpy,
      getUsersByIds: getUsersByIdsSpy,
      searchCategories: searchCategoriesSpy,
      mapStreamsToPlatformStreams: mapStreamsToPlatformStreamsSpy,
    })

    return {
      getGamesSpy,
      getStreamsSpy,
      getUsersByIdsSpy,
      mapStreamsToPlatformStreamsSpy,
      searchCategoriesSpy,
      getTwitchPlatformStreamsTask
    }
  }
})