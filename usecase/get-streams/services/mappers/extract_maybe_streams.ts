import { Option } from "/usecase/shared/functors/option.ts";
import { PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

export function extractMaybeStreams(maybeStreams: Option<PlatformStreams>[]): PlatformStreams[] {
  const streams: PlatformStreams[] = [];

  maybeStreams.forEach((maybePlatformStreams) => {
    maybePlatformStreams.map((platformStreams) => {
      streams.push(platformStreams);
    })
  })

  return streams;
}