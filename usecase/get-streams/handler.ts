import { AggregatedStreams, getAllStreams } from "./services/stream_service.ts";
import { getTwitchStreams } from "./services/twitch/streams_service.ts";
import { createTwitchHelixGateway } from "./streaming-platform-gateways/twitch/twitch_helix_gateway.ts";

export function getStreamsHandler(): Promise<AggregatedStreams> {
  const twichGateway = createTwitchHelixGateway({
    apiUrl: "https://api.twitch.tv",
    authUrl:  "https://id.twitch.tv",
    clientId: "",
    clientSecret: "",
  });

  const twitchStreamsA = getTwitchStreams(twichGateway);
  const twitchStreamsB = getTwitchStreams(twichGateway);

  return getAllStreams(twitchStreamsA, twitchStreamsB);
}