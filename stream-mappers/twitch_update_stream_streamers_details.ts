import { Maybe } from "../functors/maybe.ts";
import { TwitchUser } from "../streaming-platform-gateways/twitch_helix_gateway.ts"
import { PlatformStream, PlatformStreams } from "./types.ts"

export function updateStreamStreamerDetails(platformStreams: PlatformStreams, streamers: TwitchUser[]): PlatformStreams {
  return {
    ...platformStreams,
    streams: platformStreams.streams
      .map((stream: PlatformStream) => maybeGetStreamer(streamers, stream)
      .map((streamer: TwitchUser) => updateStreamerDetails(streamer, stream))
      .getValue(stream)) 
  }
}

const maybeGetStreamer = (streamers: TwitchUser[], platformStream: PlatformStream): Maybe<TwitchUser> => {
  return Maybe.toMaybe(streamers.find((user: TwitchUser) => user.id === platformStream.streamer.id));
}

function updateStreamerDetails(streamer: TwitchUser, platformStream: PlatformStream): PlatformStream {
  return {
    ...platformStream,
    streamer: {
      ...platformStream.streamer,
      name: streamer.display_name,
      avatarUrl: streamer.profile_image_url
    }
  }
}


