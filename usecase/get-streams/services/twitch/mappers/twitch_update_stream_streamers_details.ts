import { Option } from "/usecase/shared/functors/option.ts";
import { TwitchUser } from "../streams_service.ts"
import { PlatformStream, PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

export function updateStreamStreamerDetails(platformStreams: PlatformStreams, streamers: TwitchUser[]): PlatformStreams {
  return {
    ...platformStreams,
    streams: platformStreams.streams
      .map((stream: PlatformStream) => getStreamer(streamers, stream)
      .map((streamer: TwitchUser) => updateStreamerDetails(streamer, stream))
      .getValue(stream)) 
  }
}

const getStreamer = (streamers: TwitchUser[], platformStream: PlatformStream): Option<TwitchUser> => {
  return Option.of(streamers.find((user: TwitchUser) => user.id === platformStream.streamer.id));
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


