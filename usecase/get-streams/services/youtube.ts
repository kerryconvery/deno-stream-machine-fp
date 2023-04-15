import * as AP from "https://esm.sh/v111/fp-ts@2.13.1/lib/Apply";
import { pipe } from "https://esm.sh/v111/fp-ts@2.13.1/lib/function";
import O from "https://esm.sh/v111/fp-ts@2.13.1/lib/Option";
import TO from "https://esm.sh/v111/fp-ts@2.13.1/lib/TaskOption";
import { PlatformStreams } from "./types.ts";

export type YouTubeSearchSnippetThumbnail = {
    url: string;
}

export type YouTubeSearchSnippetThumbnails = {
    medium: YouTubeSearchSnippetThumbnail;
}

export type YouTubeSearchSnippet = {
    channelId: string;
    title: string;
    thumbnails: YouTubeSearchSnippetThumbnails;
    channelTitle: string;
}

export type YouTubeSearchItemId = {
    videoId: string;
}

export type YouTubeSearchItem = {
    id: YouTubeSearchItemId;
    snippet: YouTubeSearchSnippet;
}

export type YouTubeSearchResult = {
    items: YouTubeSearchItem[];
    nextPageToken: string;
}

export type YouTubeVideoLiveStreamingDetails = {
    concurrentViewers: number;
}

export type YouTubeVideoDetails = {
    id: string;
    liveStreamingDetails: YouTubeVideoLiveStreamingDetails;
}

export type YouTubeVideoDetailsList = {
    items: YouTubeVideoDetails[];
}


export type YouTubeChannels = {
    items: YouTubeChannel[];
};

export type YouTubeChannelSnippetThumbnail = {
    url: string;
};

export type YouTubeChannelSnippetThumbnails = {
    default: YouTubeChannelSnippetThumbnail;
};

export type YouTubeChannelSnippet = {
    title: string;
    thumbnails: YouTubeChannelSnippetThumbnails;
};

export type YouTubeChannel = {
    id: string;
    snippet: YouTubeChannelSnippet;
};

interface GetYouTubePlatformStreams {
    searchVideos: (searchTerm: O.Option<string>) => TO.TaskOption<YouTubeSearchResult>,
    getVideoDetailsByVideoIds: (videoIds: string[]) => TO.TaskOption<YouTubeVideoDetailsList>,
    getVideoChannelByChannelIds: (channelIds: string[]) => TO.TaskOption<YouTubeChannels>,
    mapVideosToPlatformStreams: (
        videos: YouTubeSearchResult,
        videDetails: YouTubeVideoDetailsList,
        videoChannels: YouTubeChannels
    ) => PlatformStreams
}

export const getYouTubePlatformStreams = ({
    searchVideos,
    getVideoDetailsByVideoIds,
    getVideoChannelByChannelIds,
    mapVideosToPlatformStreams
}: GetYouTubePlatformStreams) => (searchTerm: O.Option<string>): TO.TaskOption<PlatformStreams> => {
    return pipe(        
        TO.Do,
        TO.bind('videos', () => searchVideos(searchTerm)),
        TO.bind('videoIds', ({ videos }) => TO.some(extractVideoIds(videos.items))),
        TO.bind('channelIds', ({ videos }) => TO.some(extractChannelIds(videos.items))),
        TO.bind('videoDetails', ({ videoIds, channelIds }) => {
            return runInParallel(
                getVideoDetailsByVideoIds(videoIds),
                getVideoChannelByChannelIds(channelIds)
            )
        }),       
        TO.map(({ videos, videoDetails }) => {
            return mapVideosToPlatformStreams(videos, videoDetails.details, videoDetails.channels)
        })
    )
}

function extractVideoIds(videos: YouTubeSearchItem[]): string[] {
    return videos.map(video => video.id.videoId);
}

function extractChannelIds(videos: YouTubeSearchItem[]): string[] {
    return videos.map(video => video.snippet.channelId);
}

type VideoDetailsAndChannel = {
    details: YouTubeVideoDetailsList,
    channels: YouTubeChannels
}

const runInParallel = (
    getVideoDetailsTask: TO.TaskOption<YouTubeVideoDetailsList>,
    getVideChannelsTask: TO.TaskOption<YouTubeChannels>,
): TO.TaskOption<VideoDetailsAndChannel> => {
    return AP.sequenceS(TO.ApplicativePar)({
        details: getVideoDetailsTask,
        channels: getVideChannelsTask
    })
}