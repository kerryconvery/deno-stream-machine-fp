import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { aggregateStreams } from "../platform_streams_aggregator.ts"
import { PlatformStreams,PlatformStream } from "../../stream-providers/types.ts";

Deno.test("Stream aggreator service", async (test) => {
  await test.step("Given a list of provider streams it returns an aggregatoed list of streams", () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
        createStream('Dark souls'),
      ],
      nextPageOffset: O.some('3')
    }

    const providerBStreams: PlatformStreams = {
      source: 'providerB',
      streams: [
        createStream('The last of us'),
      ],
      nextPageOffset: O.some('2')
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
        [providerAStreams.source]: '3',
        [providerBStreams.source]: '2'
      }
    })
  })

  await test.step("Given a list of provider streams it will return next page offsets only for those providers with more pages ", () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
      ],
      nextPageOffset: O.none
    }

    const providerBStreams: PlatformStreams = {
      source: 'providerB',
      streams: [
        createStream('The last of us'),
      ],
      nextPageOffset: O.some('2')
    }

    const aggregatedStreams = aggregateStreams([
      providerAStreams,
      providerBStreams,
    ]);

    assertObjectMatch(aggregatedStreams, {
      nextPageOffsets: {
        [providerBStreams.source]: '2'
      }
    })
  })

  await test.step("Given a list of provider streams it will return no next page offsets when all providers have no more pages", () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
      ],
      nextPageOffset: O.none
    }

    const aggregatedStreams = aggregateStreams([ providerAStreams ]);

    assertObjectMatch(aggregatedStreams, {
      nextPageOffsets: {}
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