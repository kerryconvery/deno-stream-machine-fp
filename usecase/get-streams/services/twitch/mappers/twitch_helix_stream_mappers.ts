import { TwitchStream, TwitchStreams } from "../streams_service.ts"
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"
import { Option } from "/usecase/shared/functors/option.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => toPlatformStream(stream)),
    nextPageOffset: Option.of(twitchStreams.pagination.cursor)
  }
}

function toPlatformStream(stream: TwitchStream): PlatformStream {
  return {
    id: stream.id,
    title: stream.title,
    thumbnailUrl: stream.thumbnail_url,
    url: `https://www.twitch.tv/${stream.user_login}`,
    streamer: {
      id: stream.user_id,
      name: '',
      avatarUrl: ''
    },
    isLive: true,
    views: stream.viewer_count
  }
}
