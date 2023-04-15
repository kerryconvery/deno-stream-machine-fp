import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { assertSpyCall, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import { RequestFailure,RequestSuccess } from "../../../../shared/fetch_request.ts";
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
import { createYouTubeV3Gateway } from "../youtube_v3_gateway.ts";

Deno.test("YouTube v3 gateway", async (test) => {
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
        id: "abc123",
        liveStreamingDetails: liveStreamingDetails
    };
    
    const video2: YouTubeVideoDetails = {
        id: "def456",
        liveStreamingDetails: {
            concurrentViewers: 500
        }
    };
    
    const videosDetailsList: YouTubeVideoDetailsList = {
        items: [video1, video2]
    };
    
    await test.step("Give a request to search for videos it will call the YouTube V3 service and return the result", async () => {
        const { youtubeGateway, request } = makeMockGateway(TE.right(new RequestSuccess(videoSearchResult)));

        const searchResults = await youtubeGateway.searchVideos({ pageSize: 10, pageOffset: O.some('abc123') })(O.none)();

        assertSpyCall(request, 0, { args: [
            {
                url: 'https://www.googleapis.com/youtube/v3/search',
                method: 'GET',
                headers: O.some({
                    Accept: "application/json"
                }),
                body: O.none,
                queryParams: O.some(
                  {
                    part: "snippet",
                    eventType: 'Live',
                    type: "video",
                    videoCategoryId: 20,
                    maxResults: 10,
                    pageToken: 'abc123',
                    order: 'ViewCount'
                  }
                )
              }
        ]});
        assertEquals(searchResults, O.some(videoSearchResult));
    })

    await test.step("Give a request to search for videos without a page offset it will call the YouTube V3 service without a page token", async () => {
        const { youtubeGateway, request } = makeMockGateway(TE.right(new RequestSuccess(videoSearchResult)));

        await youtubeGateway.searchVideos({ pageSize: 10, pageOffset: O.none })(O.none)();

        assertSpyCall(request, 0, { args: [
            {
                url: 'https://www.googleapis.com/youtube/v3/search',
                method: 'GET',
                headers: O.some({
                    Accept: "application/json"
                }),
                body: O.none,
                queryParams: O.some(
                  {
                    part: "snippet",
                    eventType: 'Live',
                    type: "video",
                    videoCategoryId: 20,
                    maxResults: 10,
                    order: 'ViewCount'
                  }
                )
              }
        ]});
    })

    await test.step("Give a request for channels it will call the YouTube V3 service with a list of channel ids", async () => {
        const { youtubeGateway, request } = makeMockGateway(TE.right(new RequestSuccess(videoChannelList)));

        const channels = await youtubeGateway.getChannelsById(['1','2'])();

        assertSpyCall(request, 0, { args: [
            {
                url: 'https://www.googleapis.com/youtube/v3/channels',
                method: 'GET',
                headers: O.some({
                    Accept: "application/json"
                }),
                body: O.none,
                queryParams: O.some(
                  {
                    part: "id,snippet",
                    id: '1,2',
                  }
                )
              }
        ]});
        assertEquals(channels, O.some(videoChannelList));
    })

    await test.step("Give a request for videos it will call the YouTube V3 service with a list of video ids", async () => {
        const { youtubeGateway, request } = makeMockGateway(TE.right(new RequestSuccess(videosDetailsList)));

        const videos = await youtubeGateway.getVideosById(['1','2'])();

        assertSpyCall(request, 0, { args: [
            {
                url: 'https://www.googleapis.com/youtube/v3/videos',
                method: 'GET',
                headers: O.some({
                    Accept: "application/json"
                }),
                body: O.none,
                queryParams: O.some(
                  {
                    part: "id,statistics,liveStreamingDetails",
                    id: '1,2',
                  }
                )
              }
        ]});
        assertEquals(videos, O.some(videosDetailsList));
    })

    await test.step("Give a search term it will call the YouTube V3 service and include the search term", async () => {
        const { youtubeGateway, request } = makeMockGateway(TE.right(new RequestSuccess(videoSearchResult)));

        await youtubeGateway.searchVideos({ pageSize: 10, pageOffset: O.some('abc123') })(O.some('search-term'))();

        assertSpyCall(request, 0, { args: [
            {
                url: 'https://www.googleapis.com/youtube/v3/search',
                method: 'GET',
                headers: O.some({
                    Accept: "application/json"
                }),
                body: O.none,
                queryParams: O.some(
                  {
                    part: "snippet",
                    eventType: 'Live',
                    type: "video",
                    videoCategoryId: 20,
                    maxResults: 10,
                    pageToken: 'abc123',
                    order: 'ViewCount',
                    q: 'search-term'
                  }
                )
              }
        ]});
    })

    function makeMockGateway(result: TE.TaskEither<RequestFailure, RequestSuccess>) {
        const request = spy(() => result);
        const youtubeGateway = createYouTubeV3Gateway({ apiUrl: 'https://www.googleapis.com', authorisedRequest: request });
    
        return { youtubeGateway, request };
      }
})