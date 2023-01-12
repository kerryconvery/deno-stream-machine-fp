import { TwitchStream, TwitchStreams } from "/usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts";
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"
import { Option } from "/usecase/shared/functors/option.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => toPlatformStream(stream)),
    nextPageOffset: Option.toMaybe(twitchStreams.pagination.cursor)
  }
}

function toPlatformStream(stream: TwitchStream): PlatformStream {
  return {
    id: stream.id,
    title: stream.title,
    thumbnailUrl: stream.thumbnail_url,
    url: '',
    streamer: {
      id: stream.user_id,
      name: '',
      avatarUrl: ''
    },
    isLive: true,
    views: stream.viewer_count
  }
}
