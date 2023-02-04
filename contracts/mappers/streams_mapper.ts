import { AggregatedStreams,AggregatedStream, AggregatedPageOffsets } from "../../usecase/get-streams/mappers/platform_streams_aggregator.ts";
import { OutgoingStream, OutgoingStreams } from "../outgoing_streams.ts";

export function mapToOutgoingStreams(packPageOffsets: (pageOffsets: AggregatedPageOffsets) => string) {
  return (aggregatedStreams: AggregatedStreams): OutgoingStreams => {
    const outgoingStreams = {
      streams: aggregatedStreams.streams.map((stream: AggregatedStream) => mapToOutgoingStream(stream)),
      nextPageToken: packPageOffsets(aggregatedStreams.nextPageOffsets)
    }

    return outgoingStreams;
  }
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