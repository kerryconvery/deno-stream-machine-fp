import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.139.0/testing/asserts.ts"
import { Maybe } from "../../../../shared/functors/maybe.ts";
import { TwitchStream } from "../../../../streaming-platform-gateways/twitch_helix_gateway.ts";
import { mapTwitchStreamsToPlatformStreams } from "../twitch_helix_stream_mappers.ts"

Deno.test('Twitch stream mapper', async (test) => {
  await test.step('Given a list of twitch streams it will return a list of  platform streams', () => {
    const mappedStreams = mapTwitchStreamsToPlatformStreams(
      {
        data: [
          createTwitchStream('stream1', 'God of war'),
          createTwitchStream('stream2', 'Dark souls'),
        ],
        pagination: {
          cursor: '3'
        }
      },
    );
    
    assertEquals(
      mappedStreams,
      {
        source: 'twitch',
        streams: [
          {
            id: 'stream1',
            title: 'God of war',
            url: '',
            views: 10,
            thumbnailUrl: 'thumbnail',
            streamer: {
              id: 'streamer1',
              name: '',
              avatarUrl: ''
            },
            isLive: true,
          },
          {
            id: 'stream2',
            title: 'Dark souls',
            url: '',
            views: 10,
            thumbnailUrl: 'thumbnail',
            streamer: {
              id: 'streamer1',
              name: '',
              avatarUrl: ''
            },
            isLive: true,
          }
        ],
        nextPageOffset: Maybe.Some('3')
      }
    )
  })

  await test.step('Given the last page of twitch streams it will return an empty next page offset', () => {
    const mappedStreams = mapTwitchStreamsToPlatformStreams(
      {
        data: [
          createTwitchStream('stream1', 'God of war'),
        ],
        pagination: {}
      },
    );
    
    assertObjectMatch(
      mappedStreams,
      {
        nextPageOffset: Maybe.None()
      }
    )
  })

  function createTwitchStream(streamId: string, title: string): TwitchStream {
    return {
      id: streamId,
      title,
      user_id: 'streamer1',
      game_name: '',
      thumbnail_url: 'thumbnail',
      viewer_count: 10,
      isLive: true,
    }
  }
})