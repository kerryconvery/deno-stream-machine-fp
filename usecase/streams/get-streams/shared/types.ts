import { Maybe } from './functors/maybe.ts';

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
  nextPageOffset: Maybe<string>,
}

export type AggregatedPageOffsets = {
  [provider: string]: string
}

export type AggregatedStreams = {
  streams: PlatformStream[],
  nextPageOffsets: AggregatedPageOffsets 
}

export const noAggregatedStreams: AggregatedStreams = {
  streams: [],
  nextPageOffsets: {}
}
