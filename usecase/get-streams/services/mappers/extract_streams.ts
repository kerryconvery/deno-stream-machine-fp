import { Option } from "/usecase/shared/functors/option.ts";
import { PlatformStreams } from "/usecase/get-streams/services/stream_service.ts"

export function extractStreams(streams: Option<PlatformStreams>[]): PlatformStreams[] {
  const extractedStreams: PlatformStreams[] = [];

  streams.forEach((platformStreams) => {
    platformStreams.map((platformStream) => {
      extractedStreams.push(platformStream);
    })
  })

  return extractedStreams;
}