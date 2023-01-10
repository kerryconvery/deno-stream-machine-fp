import { Maybe } from '../shared/functors/maybe.ts';
import { extractMaybeStreams } from "./mappers/extract_maybe_streams.ts";
import { aggregateStreams } from "./mappers/platform_streams_aggregator.ts";
import { AggregatedStreams, PlatformStreams } from "../shared/types.ts";

export function getAllStreams(...streamSources: Promise<Maybe<PlatformStreams>>[]): Promise<AggregatedStreams> {
  return Promise.all(streamSources)
   .then((maybeStreams: Maybe<PlatformStreams>[]) => {
      return extractMaybeStreams(maybeStreams)
   })
   .then((streams: PlatformStreams[]) => {
      return aggregateStreams(streams)
   })
}