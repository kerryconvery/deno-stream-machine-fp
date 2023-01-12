import { Option } from "/usecase/shared/functors/option.ts";
import { extractStreamerIds } from "./mappers/extract_streamer_ids.ts";
import { mapTwitchStreamsToPlatformStreams } from "./mappers/twitch_helix_stream_mappers.ts";
import { updateStreamStreamerDetails } from "./mappers/twitch_update_stream_streamers_details.ts";
import { PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

export type TwitchStream = {
  id: string,
  user_id: string,
  title: string,
  game_name: string,
  thumbnail_url: string,
  viewer_count: number,
  isLive: boolean,
}

export type TwitchStreams = {
  data: TwitchStream[],
  pagination: {
    cursor?: string
  }
}

export type TwitchUser = {
  id: string,
  display_name: string,
  profile_image_url: string,
}

export type TwitchUsers = {
  data: TwitchUser[],
}
type GetUsersById = (userIds: string[]) => Promise<TwitchUser[]>;

type GetTwitchStreamsInput = {
  getStreams: () => Promise<TwitchStreams>,
  getUsersById: GetUsersById,
}

export function getTwitchStreams({ getStreams, getUsersById }: GetTwitchStreamsInput): Promise<Option<PlatformStreams>> {
  return getStreams()
    .then((twitchStreams: TwitchStreams) => {
      return mapTwitchStreamsToPlatformStreams(twitchStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return tryUpdateStreamerDetails(getUsersById, platformStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return Option.Some(platformStreams)
    })
    .catch((error: unknown) => {
      console.error(error);
      return Option.None();
    });
}

function tryUpdateStreamerDetails(getUsersById: GetUsersById, platformStreams: PlatformStreams): Promise<PlatformStreams> {
  return getUsersById(extractStreamerIds(platformStreams.streams))
    .then((users: TwitchUser[]) => {
      return updateStreamStreamerDetails(platformStreams, users)
    })
    .catch((error: unknown) => {
      console.error(error);
      return platformStreams
    })
}