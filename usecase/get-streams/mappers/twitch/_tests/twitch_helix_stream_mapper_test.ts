import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.139.0/testing/asserts.ts"
import { mapTwitchStreamsToPlatformStreams } from "../twitch_helix_stream_mappers.ts"
import { TwitchStream } from "../../../stream-providers/twitch.ts";

Deno.test('Twitch stream mapper', async (test) => {
  await test.step('Given a list of twitch streams it will return a list of platform streams', () => {
    const twitchUsers = [
      {
        id: '1',
        display_name: 'streamer1',
        profile_image_url: 'profile_image1',
      },
      {
        id: '2',
        display_name: 'streamer2',
        profile_image_url: 'profile_image2',
      }
    ]

    const twitchStreams = {
      data: [
        createTwitchStream('stream1', 'God of war', '1'),
        createTwitchStream('stream2', 'Dark souls', '2'),
      ],
      pagination: {
        cursor: '3'
      }
    }

    const mappedStreams = mapTwitchStreamsToPlatformStreams(twitchStreams, twitchUsers);
    
    assertEquals(
      mappedStreams,
      {
        source: 'twitch',
        streams: [
          {
            id: 'stream1',
            title: 'God of war',
            url: 'https://www.twitch.tv/streamer1',
            views: 10,
            thumbnailUrl: 'thumbnail-320x180.jpg',
            streamer: {
              id: '1',
              name: 'streamer1',
              avatarUrl: 'profile_image1'
            },
            isLive: true,
          },
          {
            id: 'stream2',
            title: 'Dark souls',
            url: 'https://www.twitch.tv/streamer1',
            views: 10,
            thumbnailUrl: 'thumbnail-320x180.jpg',
            streamer: {
              id: '2',
              name: 'streamer2',
              avatarUrl: 'profile_image2'
            },
            isLive: true,
          }
        ],
        nextPageOffset: O.some('3')
      }
    )
  })

  await test.step('Given that a streams\' streamer could not be found it will leave the streamer details blank', () => {
    const twitchUsers = [
      {
        id: '1',
        display_name: 'streamer1',
        profile_image_url: 'profile_image1',
      },
    ]

    const twitchStreams = {
      data: [
        createTwitchStream('stream1', 'God of war', '1'),
        createTwitchStream('stream2', 'Dark souls', '2'),
      ],
      pagination: {}
    }

    const mappedStreams = mapTwitchStreamsToPlatformStreams(twitchStreams, twitchUsers);
    
    assertObjectMatch(
      mappedStreams,
      {
        streams: [
          {
            streamer: {
              id: '1',
              name: 'streamer1',
              avatarUrl: 'profile_image1'
            },
          },
          {
            streamer: {
              id: '2',
              name: '',
              avatarUrl: ''
            },
          }
        ]
      }
    )
  })

  await test.step('Given the last page of twitch streams it will return an empty next page offset', () => {
    const twitchStreams = {
      data: [
        createTwitchStream('stream1', 'God of war', '1'),
      ],
      pagination: {}
    }

    const mappedStreams = mapTwitchStreamsToPlatformStreams(twitchStreams, []);


    assertObjectMatch(
      mappedStreams,
      {
        nextPageOffset: O.none
      }
    )
  })

  function createTwitchStream(streamId: string, title: string, userId: string): TwitchStream {
    return {
      id: streamId,
      title,
      user_id: userId,
      user_login: 'streamer1',
      thumbnail_url: 'thumbnail-{width}x{height}.jpg',
      viewer_count: 10,
      isLive: true,
    }
  }
})