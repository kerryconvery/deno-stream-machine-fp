import { Option } from '/usecase/shared/functors/option.ts';

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