import { Router } from "https://deno.land/x/oak/mod.ts";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { mapToOutgoingStreams } from "./contracts/mappers/streams_mapper.ts";
import { noOutgoingStreams } from "./contracts/outgoing_streams.ts";
import { aggregateStreams } from "./usecase/get-streams/services/mappers/platform_streams_aggregator.ts";
import { mapTwitchStreamsToPlatformStreams } from "./usecase/get-streams/services/twitch/mappers/twitch_helix_stream_mappers.ts";
import { getTwitchPlatformStreams } from "./usecase/get-streams/stream-providers/twitch.ts";
import { createTwitchHelixGateway } from "./usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts";
import { PlatformStreams } from "./usecase/get-streams/stream-providers/types.ts";

export const router = new Router();

router
  .get("/streams", async (context) => {
    const twitchGateway = getTwitchGateway();

    const twitchPlatformStreams = getTwitchPlatformStreams({
      getTwitchStreams: twitchGateway.getStreams,
      getTwitchUsersByIds: twitchGateway.getUsersById,
      mapTwitchStreamsToPlatformStreams
    });

    const streams = await pipe(
      twitchPlatformStreams(),
      TO.map((platformStreams: PlatformStreams) => aggregateStreams([platformStreams])),
      TO.map(mapToOutgoingStreams),
      TO.getOrElse(() => T.of(noOutgoingStreams))
    )();


    context.response.body = streams;
    context.response.status = 200;
  })

const getTwitchGateway = () => {
  return createTwitchHelixGateway({
    apiUrl: Deno.env.get("TWITCH_API_URL") ?? '',
    authUrl: Deno.env.get("TWITCH_AUTH_URL") ?? '',
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET") ?? '',
  });
}
  