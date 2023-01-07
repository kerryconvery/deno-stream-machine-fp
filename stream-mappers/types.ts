export type Streamer = {
  id: string;
  name: string;
  avatarUrl: string;
}

export type PlatformStream = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  streamer: Streamer;
  isLive: boolean;
  views: number;
}

export type PlatformStreams = {
  source: string,
  streams: PlatformStream[],
  nextPageOffset: number
}

export type AggregatedPageOffsets = {
  [provider: string]: number
}

export type AggregatedStreams = {
  streams: PlatformStream[],
  nextPageOffsets: AggregatedPageOffsets 
}

export const noAggregatedStreams: AggregatedStreams = {
  streams: [],
  nextPageOffsets: {}
}
