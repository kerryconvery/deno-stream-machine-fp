import { Maybe } from '../functors/maybe.ts';
import { extractMaybeStreams } from "../stream-mappers/extract_maybe_streams.ts";
import { aggregateStreams } from "../stream-mappers/platform_streams_aggregator.ts";
import { AggregatedStreams, noAggregatedStreams, PlatformStreams } from "../stream-mappers/types.ts";

export function getStreams(...streamSources: Promise<Maybe<PlatformStreams>>[]): Promise<AggregatedStreams> {
  return Promise.all(streamSources)
   .then((maybeStreams: Maybe<PlatformStreams>[]) => extractMaybeStreams(maybeStreams))
   .then((streams: PlatformStreams[]) => aggregateStreams(streams))
   .catch((err: Error) => {
     console.error(err);
     return noAggregatedStreams
   })
}