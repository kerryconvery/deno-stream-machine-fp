import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";

export type PlatformStreamStreamer = {
  id: string;
  name: string;
  avatarUrl: string;
}

export type PlatformStream = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  streamer: PlatformStreamStreamer;
  isLive: boolean;
  views: number;
}

export type PlatformStreams = {
  source: string,
  streams: PlatformStream[],
  nextPageOffset: O.Option<string>,
}

export type StreamProvider = (searchTerm: O.Option<string>) => TO.TaskOption<PlatformStreams>;