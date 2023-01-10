import { getAllStreams } from "../services/stream_service.ts";
import { maybeGetTwitchStreams } from "../services/twitch/streams_service.ts";
import { AggregatedStreams } from "../shared/types.ts";
import { createAuthorizer, createTwitchHelixGateway } from "../streaming-platform-gateways/twitch_helix_gateway.ts";

export function getStreamsHandler(): Promise<AggregatedStreams> {
  const twichGateway = createTwitchHelixGateway({
    apiUrl: "https://api.twitch.tv",
    getAuthHeaders: createAuthorizer(
      "https://id.twitch.tv",
      "",
      ""
    )
  });

  const twitchStreamsA = maybeGetTwitchStreams(twichGateway);
  const twitchStreamsB = maybeGetTwitchStreams(twichGateway);

  return getAllStreams(twitchStreamsA, twitchStreamsB);
}