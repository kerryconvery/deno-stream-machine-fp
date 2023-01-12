import { Option } from '/usecase/shared/functors/option.ts';
import { extractStreams } from "./mappers/extract_streams.ts";
import { aggregateStreams } from "./mappers/platform_streams_aggregator.ts";

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
   nextPageOffset: Option<string>,
 }

 export type AggregatedStream = {
   id: string;
   title: string;
   thumbnailUrl: string;
   url: string;
   streamer: Streamer;
   isLive: boolean;
   views: number;   
 }

 export type AggregatedPageOffsets = {
   [provider: string]: string
 }
 
 export type AggregatedStreams = {
   streams: AggregatedStream[],
   nextPageOffsets: AggregatedPageOffsets 
 }
 
 export const noAggregatedStreams: AggregatedStreams = {
   streams: [],
   nextPageOffsets: {}
 }

export function getAllStreams(...streamSources: Promise<Option<PlatformStreams>>[]): Promise<AggregatedStreams> {
  return Promise.all(streamSources)
   .then((streams: Option<PlatformStreams>[]) => {
      return extractStreams(streams)
   })
   .then((streams: PlatformStreams[]) => {
      return aggregateStreams(streams)
   })
}