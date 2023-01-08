import { getAllStreams } from "../services/stream_service.ts";
import { maybeGetTwitchStreams } from "../services/twitch/streams_service.ts";
import { AggregatedStreams } from "../stream-mappers/types.ts";
import { TwitchHelixGateway } from "../streaming-platform-gateways/twitch_helix_gateway.ts";

export function getStreamsHandler(): Promise<AggregatedStreams> {
  const twichGateway = new TwitchHelixGateway(
    "https://id.twitch.tv",
    "https://api.twitch.tv",
    "hmimgefw1924xe48uk2fhmuq1tnvfs",
    "tb8c2twoljtdbjvz6josstvie2iwl2"
  );

  const twitchStreamsA = maybeGetTwitchStreams(twichGateway);
  // const twitchStreamsB = maybeGetTwitchStreams(twichGateway);

  return getAllStreams(twitchStreamsA);
}