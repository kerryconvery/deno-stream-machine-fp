import { Router } from "https://deno.land/x/oak/mod.ts";
import { mapToOutgoingStreams } from "./contracts/mappers/streams_mapper.ts";
import { OutgoingStreams } from "./contracts/outgoing_streams.ts";

import { AggregatedStreams, getAllStreams } from "./usecase/get-streams/services/stream_service.ts";
import { getTwitchStreams } from "./usecase/get-streams/services/twitch/streams_service.ts";
import { createTwitchHelixGateway } from "./usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts";

export const router = new Router();

router
  .get("/streams", async (context) => {
    await getAllStreams(getTwitchStreams(getTwitchGateway()))
      .then((streams: AggregatedStreams) => {
        return mapToOutgoingStreams(streams);
      })
      .then((streams: OutgoingStreams) => {
        context.response.body = streams;
        context.response.status = 200; 
      })
      .catch((error) => {
        console.error(error);
        context.response.status = 500;
      })
  })

const getTwitchGateway = () => {
  return createTwitchHelixGateway({
    apiUrl: Deno.env.get("TWITCH_API_URL") ?? '',
    authUrl: Deno.env.get("TWITCH_AUTH_URL") ?? '',
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET") ?? '',
  });
}
  