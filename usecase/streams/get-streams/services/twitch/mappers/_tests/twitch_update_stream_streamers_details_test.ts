import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { TwitchUser } from "../../../../streaming-platform-gateways/twitch/twitch_helix_gateway.ts";
import { updateStreamStreamerDetails } from "../twitch_update_stream_streamers_details.ts";
import { PlatformStream, PlatformStreams } from "../../../../../../shared/types.ts"
import { Maybe } from "../../../../../../shared/functors/maybe.ts";

Deno.test('Update Twitch stream streamer details', async (test) => {
  const platformStreams: PlatformStreams = {
    source: '',
    streams: [
      createPlatformStream('God of war', 'streamer1'),
      createPlatformStream('Dark souls', 'streamer2'),
    ],
    nextPageOffset: Maybe.None()
  }

  await test.step('It will update each streams with streamer name and avatar url', () => {
    const twitchUsers: TwitchUser[] = [
      {
        id: 'streamer1',
        display_name: 'streamer One',
        profile_image_url: 'streamer1ImageUrl',
      },
      {
        id: 'streamer2',
        display_name: 'streamer Two',
        profile_image_url: 'streamer2ImageUrl',
      }
    ];

    const updatedStreams = updateStreamStreamerDetails(platformStreams, twitchUsers);

    assertEquals(updatedStreams, {
      ...platformStreams,
      streams: [
        {
          ...platformStreams.streams[0],
          streamer: {
            id:'streamer1',
            name:'streamer One',
            avatarUrl: 'streamer1ImageUrl',
          }
        },
        {
          ...platformStreams.streams[1],
          streamer: {
            id:'streamer2',
            name:'streamer Two',
            avatarUrl: 'streamer2ImageUrl',
          }
        }
      ],
    })
  })

  await test.step('It will skip streams for which streamer could not be found', () => {
    const twitchUsers: TwitchUser[] = [
      {
        id: 'streamer1',
        display_name: 'streamer One',
        profile_image_url: 'streamer1ImageUrl',
      },
    ];

    const updatedStreams = updateStreamStreamerDetails(platformStreams, twitchUsers);

    assertEquals(updatedStreams, {
      ...platformStreams,
      streams: [
        {
          ...platformStreams.streams[0],
          streamer: {
            id:'streamer1',
            name:'streamer One',
            avatarUrl: 'streamer1ImageUrl',
          }
        },
        {
          ...platformStreams.streams[1],
          streamer: {
            id:'streamer2',
            name:'',
            avatarUrl: '',
          }
        }
      ],
    })
  })

  await test.step('It will skip all streams if there are no streamers', () => {
    const twitchUsers: TwitchUser[] = [];

    const updatedStreams = updateStreamStreamerDetails(platformStreams, twitchUsers);

    assertEquals(updatedStreams, platformStreams)
  })

  function createPlatformStream(title: string, streamerId: string): PlatformStream {
    return {
      id: '',
      title,
      thumbnailUrl: '',
      url: '',
      streamer: {
        id: streamerId,
        name: '',
        avatarUrl: ''
      },
      isLive: true,
      views: 0,
    }
  }
})