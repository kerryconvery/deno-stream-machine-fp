import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { PlatformStream, PlatformStreams } from "../../../shared/types.ts"
import { aggregateStreams } from "../platform_streams_aggregator.ts"

Deno.test("Stream aggreator service", async (test) => {
  await test.step("Given a list of provider streams it returns an aggregatoed list of streams", () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
        createStream('Dark souls'),
      ],
      nextPageOffset: '3'
    }

    const providerBStreams: PlatformStreams = {
      source: 'providerB',
      streams: [
        createStream('The last of us'),
      ],
      nextPageOffset: '2'
    }

    const aggregatedStreams = aggregateStreams([
      providerAStreams,
      providerBStreams,
    ]);

    assertEquals(aggregatedStreams, {
      streams: [
        ...providerAStreams.streams,
        ...providerBStreams.streams
      ],
      nextPageOffsets: {
        [providerAStreams.source]: providerAStreams.nextPageOffset,
        [providerBStreams.source]: providerBStreams.nextPageOffset
      }
    })
  })



  await test.step("Given no list of provider streams it returns an empty aggregated list of streams", () => {
    const aggregatedStreams = aggregateStreams([]);
    
    assertEquals(aggregatedStreams, {
      streams: [],
      nextPageOffsets: {}
    })
  })

  function createStream(title: string): PlatformStream {
    return {
      id: '',
      title,
      thumbnailUrl: '',
      url: '',
      streamer: {
        id: '',
        name: '',
        avatarUrl: ''
      },
      isLive: true,
      views: 0
    }
  }
})