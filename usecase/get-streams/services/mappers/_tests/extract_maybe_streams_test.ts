import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Option } from "/usecase/shared/functors/option.ts";
import { extractMaybeStreams } from "../extract_maybe_streams.ts";
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

Deno.test('Extract streams', async (test) => {
  await test.step('Given a list of maybe streams it returns a list of streams', () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
        createStream('Dark souls'),
      ],
      nextPageOffset: Option.Some('3')
    }

    const providerBStreams: PlatformStreams = {
      source: 'providerB',
      streams: [
        createStream('The last of us'),
      ],
      nextPageOffset: Option.Some('2')
    }

    const streams = extractMaybeStreams([Option.Some(providerAStreams), Option.Some(providerBStreams)]);

    assertEquals(streams, [
      providerAStreams,
      providerBStreams
    ])
  })

  await test.step('Given a list of none maybe streams it returns an empty list of streams', () => {
    const streams = extractMaybeStreams([Option.None()]);

    assertEquals(streams, [])
  })

  await test.step('Given a list of maybe streams with none first it returns a list of streams', () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
        createStream('Dark souls'),
      ],
      nextPageOffset: Option.Some('3')
    }

    const streams = extractMaybeStreams([Option.None(), Option.Some(providerAStreams)]);

    assertEquals(streams, [
      providerAStreams,
    ])
  })

  await test.step('Given a list of maybe streams with none last it returns a list of streams', () => {
    const providerAStreams: PlatformStreams = {
      source: 'providerA',
      streams: [
        createStream('God of war'),
        createStream('Dark souls'),
      ],
      nextPageOffset: Option.Some('3')
    }

    const streams = extractMaybeStreams([Option.Some(providerAStreams), Option.None()]);

    assertEquals(streams, [
      providerAStreams,
    ])
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