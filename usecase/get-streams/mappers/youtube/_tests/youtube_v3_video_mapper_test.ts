import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts"
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import {
    YouTubeSearchSnippetThumbnail,
    YouTubeSearchSnippetThumbnails,
    YouTubeSearchSnippet,
    YouTubeSearchItemId,
    YouTubeSearchItem,
    YouTubeSearchResult,
    YouTubeChannel,
    YouTubeChannels,
    YouTubeVideoLiveStreamingDetails,
    YouTubeVideoDetails,
    YouTubeVideoDetailsList
} from "../../../services/youtube.ts";
import { mapYouTubeV3VideosToPlatformStreams } from '../youtube_v3_video_mapper.ts'

Deno.test('YouTube v3 stream mapper', async (test) => {
    const thumbnailDto1: YouTubeSearchSnippetThumbnail = {
        url: "https://example.com/thumbnail1"
    };
    
    const thumbnailsDto1: YouTubeSearchSnippetThumbnails = {
        medium: thumbnailDto1
    };
    
    const snippetDto1: YouTubeSearchSnippet = {
        channelId: "ABC123",
        title: "Example video title 1",
        thumbnails: thumbnailsDto1,
        channelTitle: "Example channel title 1"
    };
    
    const itemIdDto1: YouTubeSearchItemId = {
        videoId: "abcdefghijklmnopqrstuvwxyz1"
    };
    
    const itemDto1: YouTubeSearchItem = {
        id: itemIdDto1,
        snippet: snippetDto1
    };
    
    const thumbnailDto2: YouTubeSearchSnippetThumbnail = {
        url: "https://example.com/thumbnail2"
    };
    
    const thumbnailsDto2: YouTubeSearchSnippetThumbnails = {
        medium: thumbnailDto2
    };
    
    const snippetDto2: YouTubeSearchSnippet = {
        channelId: "XYZ789",
        title: "Example video title 2",
        thumbnails: thumbnailsDto2,
        channelTitle: "Example channel title 2"
    };
    
    const itemIdDto2: YouTubeSearchItemId = {
        videoId: "abcdefghijklmnopqrstuvwxyz2"
    };
    
    const itemDto2: YouTubeSearchItem = {
        id: itemIdDto2,
        snippet: snippetDto2
    };
    
    const videoSearchResult: YouTubeSearchResult = {
        items: [itemDto1, itemDto2],
        nextPageToken: "abcdefghijklmnopqrstuvwxyz"
    };
    
    const channel1: YouTubeChannel = {
        id: "ABC123",
        snippet: {
            title: "Sample Channel 1",
            thumbnails: {
                default: {
                    url: "https://example.com/thumbnail1.jpg",
                },
            },
        },
    };
    
    const channel2: YouTubeChannel = {
        id: "XYZ789",
        snippet: {
            title: "Sample Channel 2",
            thumbnails: {
                default: {
                    url: "https://example.com/thumbnail2.jpg",
                },
            },
        },
    };
    
    const videoChannelList: YouTubeChannels = {
        items: [channel1, channel2],
    };
    
    const liveStreamingDetails: YouTubeVideoLiveStreamingDetails = {
        concurrentViewers: 1000
    };
      
    const video1: YouTubeVideoDetails = {
        id: "abcdefghijklmnopqrstuvwxyz1",
        liveStreamingDetails: liveStreamingDetails
    };
    
    const video2: YouTubeVideoDetails = {
        id: "abcdefghijklmnopqrstuvwxyz2",
        liveStreamingDetails: {
            concurrentViewers: 500
        }
    };
    
    const videosDetailsList: YouTubeVideoDetailsList = {
        items: [video1, video2]
    };

    const platformStreamsMapper = mapYouTubeV3VideosToPlatformStreams('youTubeWebUrl')
    
    await test.step("Given video search results, the video channel and video details for each video, it will return a list of platform streams", () => {
        const platformStreams = platformStreamsMapper(videoSearchResult, videosDetailsList, videoChannelList);

        assertEquals(
            platformStreams,
            {
                source: 'youtube',
                streams: [
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz1',
                    title: 'Example video title 1',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz1',
                    views: 1000,
                    thumbnailUrl: 'https://example.com/thumbnail1',
                    streamer: {
                      id: 'ABC123',
                      name: 'Example channel title 1',
                      avatarUrl: 'https://example.com/thumbnail1.jpg'
                    },
                    isLive: true,
                  },
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz2',
                    title: 'Example video title 2',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz2',
                    views: 500,
                    thumbnailUrl: 'https://example.com/thumbnail2',
                    streamer: {
                      id: 'XYZ789',
                      name: 'Example channel title 2',
                      avatarUrl: 'https://example.com/thumbnail2.jpg'
                    },
                    isLive: true,
                  }
                ],
                nextPageOffset: O.some('abcdefghijklmnopqrstuvwxyz')
              }    
        )
    })

    await test.step("Given video search results, it will return 0 viewers if the video details could not be found", () => {
        const platformStreams = platformStreamsMapper(
            videoSearchResult,
            { items: videosDetailsList.items.slice(1) },
            videoChannelList,
        );
        
        assertEquals(
            platformStreams,
            {
                source: 'youtube',
                streams: [
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz1',
                    title: 'Example video title 1',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz1',
                    views: 0,
                    thumbnailUrl: 'https://example.com/thumbnail1',
                    streamer: {
                      id: 'ABC123',
                      name: 'Example channel title 1',
                      avatarUrl: 'https://example.com/thumbnail1.jpg'
                    },
                    isLive: true,
                  },
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz2',
                    title: 'Example video title 2',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz2',
                    views: 500,
                    thumbnailUrl: 'https://example.com/thumbnail2',
                    streamer: {
                      id: 'XYZ789',
                      name: 'Example channel title 2',
                      avatarUrl: 'https://example.com/thumbnail2.jpg'
                    },
                    isLive: true,
                  }
                ],
                nextPageOffset: O.some('abcdefghijklmnopqrstuvwxyz')
              }    
        )
    })

    await test.step("Given video search results, it will return an empty avatar url if the video channel could not be found", () => {
        const platformStreams = platformStreamsMapper(
            videoSearchResult,
            videosDetailsList,
            { items: videoChannelList.items.slice(1) },
        );
        
        assertEquals(
            platformStreams,
            {
                source: 'youtube',
                streams: [
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz1',
                    title: 'Example video title 1',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz1',
                    views: 1000,
                    thumbnailUrl: 'https://example.com/thumbnail1',
                    streamer: {
                      id: 'ABC123',
                      name: 'Example channel title 1',
                      avatarUrl: ''
                    },
                    isLive: true,
                  },
                  {
                    id: 'abcdefghijklmnopqrstuvwxyz2',
                    title: 'Example video title 2',
                    url: 'youTubeWebUrl/watch?v=abcdefghijklmnopqrstuvwxyz2',
                    views: 500,
                    thumbnailUrl: 'https://example.com/thumbnail2',
                    streamer: {
                      id: 'XYZ789',
                      name: 'Example channel title 2',
                      avatarUrl: 'https://example.com/thumbnail2.jpg'
                    },
                    isLive: true,
                  }
                ],
                nextPageOffset: O.some('abcdefghijklmnopqrstuvwxyz')
              }    
        )
    })
})