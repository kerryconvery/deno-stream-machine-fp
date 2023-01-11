import { Maybe } from "../../../../shared/functors/maybe.ts";
import { PlatformStreams } from "../../../../shared/types.ts";

export function extractMaybeStreams(maybeStreams: Maybe<PlatformStreams>[]): PlatformStreams[] {
  const streams: PlatformStreams[] = [];

  maybeStreams.forEach((maybePlatformStreams) => {
    maybePlatformStreams.map((platformStreams) => {
      streams.push(platformStreams);
    })
  })

  return streams;
}