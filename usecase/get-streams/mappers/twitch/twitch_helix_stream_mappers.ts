import { TwitchStream, TwitchStreams, TwitchUser } from "../../stream-providers/twitch.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { PlatformStreams, PlatformStream } from "../../stream-providers/types.ts";

export function mapTwitchStreamsToPlatformStreams(twitchStreams: TwitchStreams, twitchUsers: TwitchUser[]): PlatformStreams {
  return {
    source: 'twitch',
    streams: twitchStreams.data.map(stream => {
      const streamer = twitchUsers.find(user => user.id === stream.user_id);

      return toPlatformStream(stream, streamer ?? blankStreamer)
    }),
    nextPageOffset: O.fromNullable(twitchStreams.pagination.cursor)
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