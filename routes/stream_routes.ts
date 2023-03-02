import { Router } from "https://deno.land/x/oak/mod.ts";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import * as O from  "https://esm.sh/fp-ts@2.13.1/Option";
import { mapToOutgoingStreams } from "/contracts/mappers/streams_mapper.ts";
import { noOutgoingStreams } from "/contracts/outgoing_streams.ts";
import { aggregateStreams } from "/usecase/get-streams/mappers/platform_streams_aggregator.ts";
import { mapTwitchStreamsToPlatformStreams } from "/usecase/get-streams/mappers/twitch/twitch_helix_stream_mappers.ts";
import { getTwitchPlatformStreams } from "/usecase/get-streams/stream-providers/twitch.ts";
import { PlatformStreams } from "/usecase/get-streams/stream-providers/types.ts";
import { twitchRequestAuthoriser } from "/usecase/get-streams/streaming-platform-gateways/twitch/request_authoriser.ts";
import { createTwitchHelixGateway } from "/usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts";
import { fetchRequest } from "/usecase/shared/fetch_request.ts";
import { twitchAuthenticatedRequest } from "/usecase/get-streams/streaming-platform-gateways/twitch/authenticated_request.ts";
import { packPageTokens, unpackPageToken } from "/contracts/mappers/pack_token_pack.ts";

export const router = new Router();

const defaultPageSize = 8;
const twitchGateway = getTwitchGateway();

interface SearchParams {
  pageOffsets: Record<string, string>,
  searchTerm: O.Option<string>,
}

router
  .get("/streams", async (context) => {
    const streams = await pipe(
      O.Do,
      O.bind('pageOffsets', () => O.some(getPageOffsets(context.request.url.searchParams))),
      O.bind('searchTerm', () => O.some(getSearchTerm(context.request.url.searchParams))),
      O.map((parameters: SearchParams) => createStreamProviders(parameters)),
      TO.fromOption,
      TO.map((streamProviders) => invokeStreamProviders(streamProviders)),
      TO.chain((providerTasks) => TO.sequenceArray(providerTasks)),
      TO.map((platformStreamsCollection: readonly PlatformStreams[]) => aggregateStreams(platformStreamsCollection)),
      TO.map(mapToOutgoingStreams(packPageTokens)),
      TO.getOrElse(() => T.of(noOutgoingStreams))
    )();

    context.response.body = streams;
    context.response.status = 200;
  })

type StreamProvider = () => TO.TaskOption<PlatformStreams>;

function getPageOffsets(searchParams: URLSearchParams): Record<string, string> {
  return pipe(
    O.fromNullable(searchParams.get('pagetoken')),
    O.match(
      () => ({}),
      (pagetoken: string) => unpackPageToken(pagetoken) 
    )
  )
}

function getSearchTerm(searchParams: URLSearchParams): O.Option<string> {
  return O.fromNullable(searchParams.get('searchterm'))
}

function createStreamProviders(parameters: SearchParams): StreamProvider[] {
  return [createTwitchStreamProvider(parameters.pageOffsets)];
}

function createTwitchStreamProvider(pageOffsets: Record<string, string>): StreamProvider {  
  return getTwitchPlatformStreams({
    getTwitchStreams: twitchGateway.getStreams({ pageSize: O.some(defaultPageSize), pageOffset: O.fromNullable(pageOffsets['twitch']) }),
    getTwitchUsersByIds: twitchGateway.getUsersById,
    mapTwitchStreamsToPlatformStreams
  });
}

function invokeStreamProviders(streamProviders: StreamProvider[]): TO.TaskOption<PlatformStreams>[] {
  return streamProviders.map(streamProvider => streamProvider())
}

function getTwitchGateway() {
  const request = fetchRequest(fetch);

  const authorisedRequest = twitchRequestAuthoriser({
    authUrl: Deno.env.get("TWITCH_AUTH_URL") ?? '',
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET") ?? '',
    request, 
  })

  const twitchClient = twitchAuthenticatedRequest({
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    getAccessToken: authorisedRequest,
    request,
  })

  return createTwitchHelixGateway({
    apiUrl: Deno.env.get("TWITCH_API_URL") ?? '',
    authorisedRequest: twitchClient
  })
}

