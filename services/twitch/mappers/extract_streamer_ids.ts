import { PlatformStream } from "../../../shared/types.ts";

export function extractStreamerIds(
  streams: PlatformStream[]
): string[] {
  return streams.map((stream) => {
    return stream.streamer.id
  })
}