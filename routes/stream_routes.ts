import { Router } from "https://deno.land/x/oak/mod.ts";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import * as O from  "https://esm.sh/fp-ts@2.13.1/Option";
import { mapToOutgoingStreams } from "/contracts/mappers/streams_mapper.ts";
import { noOutgoingStreams } from "/contracts/outgoing_streams.ts";
import { aggregateStreams } from "/usecase/get-streams/mappers/platform_streams_aggregator.ts";
import { PlatformStreams, StreamProvider } from "/usecase/get-streams/stream-providers/types.ts";
import { packPageTokens, unpackPageToken } from "/contracts/mappers/pack_token_pack.ts";
import { createStreamProviders, SearchParams } from "./stream_providers_factor.ts";

export const router = new Router();

const defaultPageSize = 10;

router
  .get("/streams", async (context) => {
    const streams = await pipe(
      O.Do,
      O.bind('pageOffsets', () => O.some(getPageOffsets(context.request.url.searchParams))),
      O.bind('searchTerm', () => O.some(getSearchTerm(context.request.url.searchParams))),
      O.bind('pageSize', () => O.some<number>(defaultPageSize)),
      O.bind('streamProviders', (parameters: SearchParams) => O.some(createStreamProviders(parameters))),
      TO.fromOption,
      TO.map(invokeStreamProviders),
      TO.chain(TO.sequenceArray),
      TO.map(aggregateStreams),
      TO.map(mapToOutgoingStreams(packPageTokens)),
      TO.getOrElse(() => T.of(noOutgoingStreams))
    )();

    context.response.body = streams;
    context.response.status = 200;
  })

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

function invokeStreamProviders(
  {
    streamProviders,
    searchTerm
  }: {
    streamProviders: StreamProvider[],
    searchTerm: O.Option<string>
  }): TO.TaskOption<PlatformStreams>[] {
  return streamProviders.map(streamProvider => streamProvider(searchTerm))
}