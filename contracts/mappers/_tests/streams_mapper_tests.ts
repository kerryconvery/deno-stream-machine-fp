
import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { AggregatedStreams } from "../../../usecase/get-streams/services/mappers/platform_streams_aggregator.ts";
import { mapToOutgoingStreams } from "../streams_mapper.ts";

Deno.test("Streams mapper", async (test) => {
  await test.step("Given a list of aggregated streams, it maps them to streams", () => {

    const aggregatedStreams: AggregatedStreams = {
      streams: [
        {
          id: "stream1",
          title: "stream1-title",
          thumbnailUrl: "stream1-thumbnailUrl",
          url: "stream1-url",
          streamer: {
            id: "streamer1",
            name: "streamer1-name",
            avatarUrl: "streamer1-avatarUrl",
          },
          isLive: true,
          views: 1
        },
        {
          id: "stream2",
          title: "stream2-title",
          thumbnailUrl: "stream2-thumbnailUrl",
          url: "stream2-url",
          streamer: {
            id: "streamer2",
            name: "streamer2-name",
            avatarUrl: "streamer2-avatarUrl",
          },
          isLive: true,
          views: 2
        }
      ],
      nextPageOffsets: {
        provider1: "provider1_offset",
        provider2: "provider2_offset",
      }
    };

    const outgoingStreams = mapToOutgoingStreams(aggregatedStreams);

    assertEquals(outgoingStreams, {
      streams: [
        {
          streamTitle: 'stream1-title',
          streamThumbnailUrl: 'stream1-thumbnailUrl',
          streamUrl: 'stream1-url',
          streamerName: 'streamer1-name',
          streamerAvatarUrl: 'streamer1-avatarUrl',
          isLive: true,
          views: 1
        },
        {
          streamTitle: 'stream2-title',
          streamThumbnailUrl: 'stream2-thumbnailUrl',
          streamUrl: 'stream2-url',
          streamerName: 'streamer2-name',
          streamerAvatarUrl: 'streamer2-avatarUrl',
          isLive: true,
          views: 2
        }
      ],
      nextPageToken: 'provider1:provider1_offset,provider2:provider2_offset'
    })
  })
})