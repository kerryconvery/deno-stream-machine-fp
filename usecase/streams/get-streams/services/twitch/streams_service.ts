import { Maybe } from "../../shared/functors/maybe.ts";
import { extractStreamerIds } from "./mappers/extract_streamer_ids.ts";
import { mapTwitchStreamsToPlatformStreams } from "./mappers/twitch_helix_stream_mappers.ts";
import { updateStreamStreamerDetails } from "./mappers/twitch_update_stream_streamers_details.ts";
import { PlatformStreams } from "../../shared/types.ts";
import { TwitchStreams, TwitchUser } from "../../streaming-platform-gateways/twitch_helix_gateway.ts";

type GetUsersById = (userIds: string[]) => Promise<TwitchUser[]>;

type GetTwitchStreamsInput = {
  getStreams: () => Promise<TwitchStreams>,
  getUsersById: GetUsersById,
}

export function maybeGetTwitchStreams({ getStreams, getUsersById }: GetTwitchStreamsInput): Promise<Maybe<PlatformStreams>> {
  return getStreams()
    .then((twitchStreams: TwitchStreams) => {
      return mapTwitchStreamsToPlatformStreams(twitchStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return tryUpdateStreamerDetails(getUsersById, platformStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return Maybe.Some(platformStreams)
    })
    .catch((error: unknown) => {
      console.error(error);
      return Maybe.None();
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