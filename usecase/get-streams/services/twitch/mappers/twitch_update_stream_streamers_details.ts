import { Option } from "/usecase/shared/functors/option.ts";
import { TwitchUser } from "/usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts"
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

export function updateStreamStreamerDetails(platformStreams: PlatformStreams, streamers: TwitchUser[]): PlatformStreams {
  return {
    ...platformStreams,
    streams: platformStreams.streams
      .map((stream: PlatformStream) => maybeGetStreamer(streamers, stream)
      .map((streamer: TwitchUser) => updateStreamerDetails(streamer, stream))
      .getValue(stream)) 
  }
}

const maybeGetStreamer = (streamers: TwitchUser[], platformStream: PlatformStream): Option<TwitchUser> => {
  return Option.toMaybe(streamers.find((user: TwitchUser) => user.id === platformStream.streamer.id));
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


