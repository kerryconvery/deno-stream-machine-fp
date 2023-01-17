export interface OutgoingStream {
  streamTitle: string;
  streamThumbnailUrl: string;
  streamUrl: string;
  streamerName: string;
  streamerAvatarUrl: string;
  isLive: boolean;
  views: number;
}

export interface OutgoingStreams {
  streams: OutgoingStream[];
  nextPageToken: string;
}
