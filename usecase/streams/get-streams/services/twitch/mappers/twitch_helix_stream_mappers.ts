import { TwitchStream, TwitchStreams } from "../../../streaming-platform-gateways/twitch_helix_gateway.ts";
import { PlatformStream, PlatformStreams } from "../../../shared/types.ts";
import { Maybe } from "../../../shared/functors/maybe.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => toPlatformStream(stream)),
    nextPageOffset: Maybe
      .toMaybe(twitchStreams.pagination.cursor)
      .getValue("")
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
