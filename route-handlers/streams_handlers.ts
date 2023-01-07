import { getStreams } from "../services/stream_service.ts";
import { getTwitchStreams } from "../services/twitch/streams_service.ts";
import { AggregatedStreams } from "../stream-mappers/types.ts";
import { TwitchHelixGateway } from "../streaming-platform-gateways/twitch_helix_gateway.ts";

export function getStreamsHandler(): Promise<AggregatedStreams> {
  const twichGateway = new TwitchHelixGateway("");

  const twitchStreamsA = getTwitchStreams(twichGateway);
  const twitchStreamsB = getTwitchStreams(twichGateway);

  return getStreams(twitchStreamsA, twitchStreamsB);
}