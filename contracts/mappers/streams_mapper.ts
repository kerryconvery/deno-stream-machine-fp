import { AggregatedStreams,AggregatedStream } from "../../usecase/get-streams/services/mappers/platform_streams_aggregator.ts";
import { OutgoingStream, OutgoingStreams } from "../outgoing_streams.ts";

export function mapToOutgoingStreams(aggregatedStreams: AggregatedStreams): OutgoingStreams {
  const outgoingStreams = {
    streams: aggregatedStreams.streams.map((stream: AggregatedStream) => mapToOutgoingStream(stream)),
    nextPageToken: packNextPageOffsets(aggregatedStreams.nextPageOffsets)
  }

  return outgoingStreams;
}

function mapToOutgoingStream(aggregatedStream: AggregatedStream): OutgoingStream {
  return {
    streamTitle: aggregatedStream.title,
    streamThumbnailUrl: aggregatedStream.thumbnailUrl,
    streamUrl: aggregatedStream.url,
    streamerName: aggregatedStream.streamer.name,
    streamerAvatarUrl: aggregatedStream.streamer.avatarUrl,
    isLive: aggregatedStream.isLive,
    views: aggregatedStream.views
  }
}

function packNextPageOffsets(nextPageOffsets: Record<string, string>): string {
  return Object.entries(nextPageOffsets).reduce(
    (nextPageTokens: string[], [provider, offset]: [string, string]) => {
      nextPageTokens.push(`${provider}:${offset}`);

      return nextPageTokens;
    },
    []
  ).join(',')
}