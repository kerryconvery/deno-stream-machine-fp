import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import {
    assertSpyCall,
    spy,
} from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import { PlatformStreams } from "../types.ts";
import {
    getYouTubePlatformStreams,
    YouTubeSearchSnippetThumbnail,
    YouTubeSearchSnippetThumbnails,
    YouTubeSearchSnippet,
    YouTubeSearchItemId,
    YouTubeSearchItem,
    YouTubeSearchResult,
    YouTubeVideoDetails,
    YouTubeVideoLiveStreamingDetails,
    YouTubeVideoDetailsList,
YouTubeChannel,
YouTubeChannels
} from "../youtube.ts";

Deno.test("Youtube stream provider", async (test) => {
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

    const expectedPlatformStreams: PlatformStreams = {
        source: '',
        streams: [{
            id: '',
            title: '',
            thumbnailUrl: '',
            url: '',
            streamer: {
              id: '',
              name: '',
              avatarUrl: ''
            },
            isLive: true,
            views: 0
        }],
        nextPageOffset: O.none,
    }
      
    const searchVideosSpy = spy((_searchTerm: O.Option<string>): TO.TaskOption<YouTubeSearchResult> => TO.some(videoSearchResult));
    const getVideoDetailsByVideoIdsSpy = spy((_videoIds: string[]): TO.TaskOption<YouTubeVideoDetailsList> => TO.some(videosDetailsList));
    const getVideoChannelByChannelIdsSpy = spy((_channelIds: string[]): TO.TaskOption<YouTubeChannels> => TO.some(videoChannelList));
    const mapVideosToPlatformStreamsSpy = spy((_videos: YouTubeSearchResult, _videDetails: YouTubeVideoDetailsList, _videoChannels: YouTubeChannels) => expectedPlatformStreams)
    
    const getYouTubePlatformStreamsTask = getYouTubePlatformStreams({
        searchVideos: searchVideosSpy,
        getVideoDetailsByVideoIds: getVideoDetailsByVideoIdsSpy,
        getVideoChannelByChannelIds: getVideoChannelByChannelIdsSpy,
        mapVideosToPlatformStreams: mapVideosToPlatformStreamsSpy
    });

    await test.step("Given a search term it will pass the search term will searching for streams", async () => {
        await getYouTubePlatformStreamsTask(O.some("example"))();

        assertSpyCall(searchVideosSpy, 0,  { args: [O.some("example")] });
    })

    await test.step("Given a list of YouTube videos it will get the details of each video", async () => {
        await getYouTubePlatformStreamsTask(O.none)();

        assertSpyCall(getVideoDetailsByVideoIdsSpy, 0,  { args: [['abcdefghijklmnopqrstuvwxyz1', 'abcdefghijklmnopqrstuvwxyz2' ]] });
    })

    await test.step("Given a list of YouTube videos it will get the channel of each video", async () => {
        await getYouTubePlatformStreamsTask(O.none)();

        assertSpyCall(getVideoChannelByChannelIdsSpy, 0,  { args: [['ABC123', 'XYZ789' ]] });
    })
    
    await test.step("Given all of the details of YouTube videos it will map those into platform streams", async () => {
        const platformStreams = await getYouTubePlatformStreamsTask(O.none)();

        assertSpyCall(mapVideosToPlatformStreamsSpy, 0,  { args: [videoSearchResult, videosDetailsList, videoChannelList] });
        assertEquals(platformStreams, O.some(expectedPlatformStreams))
    })

    await test.step("Given that no videos were found it will return back no platform streams", async () => {
        const task = getYouTubePlatformStreams({
            searchVideos: spy((_searchTerm: O.Option<string>): TO.TaskOption<YouTubeSearchResult> => TO.none),
            getVideoDetailsByVideoIds: getVideoDetailsByVideoIdsSpy,
            getVideoChannelByChannelIds: getVideoChannelByChannelIdsSpy,
            mapVideosToPlatformStreams: mapVideosToPlatformStreamsSpy
        });

        const platformStreams = await task(O.none)();

        assertEquals(platformStreams, O.none)
    })

    await test.step("Give that no videos details were found it will return back no platform streams", async () => {
        const task = getYouTubePlatformStreams({
            searchVideos: searchVideosSpy,
            getVideoDetailsByVideoIds: spy((_videoIds: string[]): TO.TaskOption<YouTubeVideoDetailsList> => TO.none),
            getVideoChannelByChannelIds: getVideoChannelByChannelIdsSpy,
            mapVideosToPlatformStreams: mapVideosToPlatformStreamsSpy
        });

        const platformStreams = await task(O.none)();

        assertEquals(platformStreams, O.none)
    })

    await test.step("Give that no videos channels were found it will return back no platform streams", async () => {
        const task = getYouTubePlatformStreams({
            searchVideos: searchVideosSpy,
            getVideoDetailsByVideoIds: getVideoDetailsByVideoIdsSpy,
            getVideoChannelByChannelIds:spy((_channelIds: string[]): TO.TaskOption<YouTubeChannels> => TO.none),
            mapVideosToPlatformStreams: mapVideosToPlatformStreamsSpy
        });

        const platformStreams = await task(O.none)();

        assertEquals(platformStreams, O.none)
    })
})