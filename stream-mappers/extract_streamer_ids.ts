import { PlatformStream } from "./types.ts";

export function extractStreamerIds(
  streams: PlatformStream[]
): string[] {
  return streams.map((stream) => {
    return stream.streamer.id
  })
}