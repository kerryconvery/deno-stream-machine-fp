import { pipe } from "https://esm.sh/v111/fp-ts@2.13.1/lib/function";
import * as A from "https://esm.sh/v103/fp-ts@2.13.1/lib/Array";
import * as O from "https://esm.sh/v103/fp-ts@2.13.1/lib/Option";
import { PlatformStream, PlatformStreams } from "../../services/types.ts";
import {
    YouTubeSearchResult,
    YouTubeChannels,
    YouTubeVideoDetailsList,
YouTubeSearchItem
} from "../../services/youtube.ts";

export function mapYouTubeV3VideosToPlatformStreams(
    videoBaseUrl: string
) {
    return (
        videoSearchResult: YouTubeSearchResult,
        videoDetails: YouTubeVideoDetailsList,
        videoChannels: YouTubeChannels,
    ): PlatformStreams => {
        return {
            source: 'youtube',
            streams: mapToPlatformStreams(
                videoBaseUrl,
                videoChannels,
                videoDetails
            )(videoSearchResult.items),
            nextPageOffset: O.some(videoSearchResult.nextPageToken)
        }
    }
}

function mapToPlatformStreams(   
    videoBaseUrl: string,     
    videoChannels: YouTubeChannels,
    videoDetails: YouTubeVideoDetailsList
) {
    return A.map((searchResultItem: YouTubeSearchItem) => {
        return pipe(
            {
                videoBaseUrl,
                searchResultItem,
                viewers: getViewers(videoDetails, searchResultItem.id.videoId),
                avatarUrl: getAvatarUrl(videoChannels, searchResultItem.snippet.channelId)
            },
            mapToPlatformStream
        )
    })
}

function getViewers(videoDetails: YouTubeVideoDetailsList, videoId: string): number {
    return pipe(
        O.fromNullable(videoDetails.items.find(videoDetailsItem => videoDetailsItem.id === videoId)),
        O.map((videoDetailsItem) => videoDetailsItem.liveStreamingDetails.concurrentViewers),
        O.getOrElse<number>(() => 0)
    )
}

function getAvatarUrl(videoChannels: YouTubeChannels, channelId: string): string {
    return pipe(
        O.fromNullable(videoChannels.items.find(channelItem => channelItem.id === channelId)),
        O.map((channelItem) => channelItem.snippet.thumbnails.default.url),
        O.getOrElse<string>(() => '')
    )
}

function mapToPlatformStream({
    videoBaseUrl,
    searchResultItem,
    viewers,
    avatarUrl
}: {
    videoBaseUrl: string,
    searchResultItem: YouTubeSearchItem,
    viewers: number,
    avatarUrl: string
}): PlatformStream {
    return {
        streamer: {
            id: searchResultItem.snippet.channelId,
            name: searchResultItem.snippet.channelTitle,
            avatarUrl: avatarUrl
        },
        id: searchResultItem.id.videoId,
        title: searchResultItem.snippet.title,
        thumbnailUrl: searchResultItem.snippet.thumbnails.medium.url,
        url: `${videoBaseUrl}/watch?v=${searchResultItem.id.videoId}`,
        isLive: true,
        views: viewers,
    }
}