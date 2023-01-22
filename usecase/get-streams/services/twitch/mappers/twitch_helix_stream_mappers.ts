import { TwitchStream, TwitchStreams, TwitchUser } from "../../../stream-providers/twitch.ts";
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"
import { Option } from "/usecase/shared/functors/option.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams, twitchUsers: TwitchUser[]): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => {
      const streamer = twitchUsers.find(user => user.id === stream.user_id);

      return toPlatformStream(stream, streamer ?? blankStreamer)
    }),
    nextPageOffset: Option.of(twitchStreams.pagination.cursor)
  }
}

function toPlatformStream(stream: TwitchStream, streamer: TwitchUser): PlatformStream {
  return {
    id: stream.id,
    title: stream.title,
    thumbnailUrl: stream.thumbnail_url,
    url: `https://www.twitch.tv/${stream.user_login}`,
    streamer: {
      id: stream.user_id,
      name: streamer.display_name,
      avatarUrl: streamer.profile_image_url,
    },
    isLive: true,
    views: stream.viewer_count
  }
}

const blankStreamer: TwitchUser = {
  id: '',
  display_name: '',
  profile_image_url: ''
}