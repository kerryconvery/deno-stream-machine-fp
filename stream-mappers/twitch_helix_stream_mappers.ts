import { TwitchStream, TwitchStreams } from "../streaming-platform-gateways/twitch_helix_gateway.ts";
import { PlatformStream, PlatformStreams } from "./types.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => toPlatformStream(stream)),
    nextPageOffset: twitchStreams.nextPageOffset
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
