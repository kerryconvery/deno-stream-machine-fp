import { PlatformStreams,AggregatedStreams, noAggregatedStreams } from "../../shared/types.ts";

export function aggregateStreams(
    platformStreamsCollection: PlatformStreams[]
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
      ...nextPageOffset
          .map((cursor: string) => ({ [source]: cursor }))
          .getValue({})
    }
  }
}  
