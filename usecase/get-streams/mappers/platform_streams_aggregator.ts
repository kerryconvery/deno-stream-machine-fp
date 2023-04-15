import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { PlatformStreams } from "../services/types.ts";

export type AggregatedStreamStreamer = {
  id: string;
  name: string;
  avatarUrl: string;
}

export type AggregatedStream = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  streamer: AggregatedStreamStreamer;
  isLive: boolean;
  views: number;   
}

export type AggregatedPageOffsets = {
  [provider: string]: string
}

export type AggregatedStreams = {
  streams: AggregatedStream[],
  nextPageOffsets: AggregatedPageOffsets 
}

export const noAggregatedStreams: AggregatedStreams = {
  streams: [],
  nextPageOffsets: {}
}

export function aggregateStreams(
  platformStreamsCollection: readonly PlatformStreams[]
): AggregatedStreams {
  const streams = platformStreamsCollection.reduce(
    (
      aggregatedStreams: AggregatedStreams,
      platformStreams: PlatformStreams
    ) => {
      return addPlatformStreams(aggregatedStreams, platformStreams);
    },
    noAggregatedStreams
  )

  return streams;
}

function addPlatformStreams(
  aggregatedStreams: AggregatedStreams,
  platformStreams: PlatformStreams
): AggregatedStreams {
  const { streams, source, nextPageOffset } = platformStreams;

  return {
    streams: [
      ...aggregatedStreams.streams,
      ...streams
    ],
    nextPageOffsets: {
      ...aggregatedStreams.nextPageOffsets,
      ...aggregatePageOffset(nextPageOffset, source)
    }
  }
}  

const aggregatePageOffset = (nextPageOffset: O.Option<string>, source: string) => {
  return pipe(
    nextPageOffset,
    O.map((cursor: string) => ({ [source]: cursor })),
    O.getOrElse(() => ({}))
  )
}