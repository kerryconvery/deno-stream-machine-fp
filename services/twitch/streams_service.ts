import { Maybe } from "../../functors/maybe.ts";
import { extractStreamerIds } from "../../stream-mappers/extract_streamer_ids.ts";
import { mapTwitchStreamsToPlatformStreams } from "../../stream-mappers/twitch_helix_stream_mappers.ts";
import { updateStreamStreamerDetails } from "../../stream-mappers/twitch_update_stream_streamers_details.ts";
import { PlatformStreams } from "../../stream-mappers/types.ts";
import { TwitchStreams, TwitchUser } from "../../streaming-platform-gateways/twitch_helix_gateway.ts";
import { TwitchHelixGateway } from "../../streaming-platform-gateways/twitch_helix_gateway.ts"

export function maybeGetTwitchStreams(gateway: TwitchHelixGateway): Promise<Maybe<PlatformStreams>> {
  return gateway.getStreams()
    .then((twitchStreams: TwitchStreams) => {
      return mapTwitchStreamsToPlatformStreams(twitchStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return tryUpdateStreamerDetails(gateway, platformStreams)
    })
    .then((platformStreams: PlatformStreams) => {
      return Maybe.Some(platformStreams)
    })
    .catch((error: unknown) => {
      console.error('Error getting twitch streams -', error);
      return Maybe.None();
    });
}

function tryUpdateStreamerDetails(gateway: TwitchHelixGateway, platformStreams: PlatformStreams): Promise<PlatformStreams> {
  return gateway.getUsersById(extractStreamerIds(platformStreams.streams))
    .then((users: TwitchUser[]) => {
      return updateStreamStreamerDetails(platformStreams, users)
    })
    .catch((error: unknown) => {
      console.error(error);
      return platformStreams
    })
}