import { PlatformStream } from "/usecase/get-streams/services/stream_service.ts"

export function extractStreamerIds(
  streams: PlatformStream[]
): string[] {
  return streams.map((stream) => {
    return stream.streamer.id
  })
}