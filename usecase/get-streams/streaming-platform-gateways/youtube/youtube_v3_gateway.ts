import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";
import { YouTubeChannels, YouTubeSearchResult, YouTubeVideoDetailsList } from "../../stream-providers/youtube.ts";
import { RequestParams,RequestFailure,RequestSuccess, RequestMethod } from "../../../shared/fetch_request.ts";
import { removeNoneParams } from "../../../shared/fp_utils.ts";

export type YouTubeV3GatewayParams = {
    apiUrl: string,
    authorisedRequest: <T>(params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>
}

  
type YouTubeVideoOptions = {
    pageSize: number,
    pageOffset: O.Option<string>
  }

export interface YouTubeV3Gateway {
    searchVideos: (options: YouTubeVideoOptions) => (searchTerm: O.Option<string>) => TO.TaskOption<YouTubeSearchResult>,
    getChannelsById: (channelIds: string[]) => TO.TaskOption<YouTubeChannels>,
    getVideosById: (VideoIds: string[]) => TO.TaskOption<YouTubeVideoDetailsList>,
}
  
export function createYouTubeV3Gateway({ apiUrl, authorisedRequest }: YouTubeV3GatewayParams): YouTubeV3Gateway {
    return {
        searchVideos: ({ pageSize, pageOffset }: YouTubeVideoOptions) => (searchTerm: O.Option<string>): TO.TaskOption<YouTubeSearchResult> => {
          return pipe(
            TE.Do,
            TE.bind('url', () => TE.right(`${apiUrl}/youtube/v3/search`)),
            TE.bind('method', () => TE.right('GET' as RequestMethod)),
            TE.bind('headers', () => TE.right(O.some({
                Accept: "application/json"
            }))),
            TE.bind('queryParams', () => TE.right(pipe(
              {
                q: searchTerm,
                pageToken: pageOffset,
              },
              removeNoneParams,
              O.match(() => O.some({}), (queryParams) => O.some(queryParams)),
              O.map((queryParams: Record<string, unknown>) => ({
                ...queryParams,
                part: "snippet",
                eventType: 'Live',
                type: "video",
                videoCategoryId: 20,
                maxResults: pageSize,
                order: 'ViewCount',
              })),
            ))),
            TE.bind('body', () => TE.right(O.none)),
            TE.chain((requestParams) => authorisedRequest<YouTubeSearchResult>(requestParams)),
            TO.fromTaskEither,
            TO.map((result: RequestSuccess) => result.getData() as YouTubeSearchResult)
          )
        },
        getChannelsById: (channelIds: string[]): TO.TaskOption<YouTubeChannels> => {
          return pipe(
            TE.Do,
            TE.bind('url', () => TE.right(`${apiUrl}/youtube/v3/channels`)),
            TE.bind('method', () => TE.right('GET' as RequestMethod)),
            TE.bind('headers', () => TE.right(O.some({
              Accept: 'application/json',
            }))),
            TE.bind('queryParams', () => TE.right(O.some({
              part: "id,snippet",
              id: channelIds.join(','),
            }))),
            TE.bind('body', () => TE.right(O.none)),
            TE.chain((requestParams) => authorisedRequest<YouTubeChannels>(requestParams)),
            TO.fromTaskEither,
            TO.map((result: RequestSuccess) => result.getData() as YouTubeChannels)
          )
        },
        getVideosById: (channelIds: string[]): TO.TaskOption<YouTubeVideoDetailsList> => {
          return pipe(
            TE.Do,
            TE.bind('url', () => TE.right(`${apiUrl}/youtube/v3/videos`)),
            TE.bind('method', () => TE.right('GET' as RequestMethod)),
            TE.bind('headers', () => TE.right(O.some({
              Accept: 'application/json',
            }))),
            TE.bind('queryParams', () => TE.right(O.some({
              part: "id,statistics,liveStreamingDetails",
              id: channelIds.join(','),
            }))),
            TE.bind('body', () => TE.right(O.none)),
            TE.chain((requestParams) => authorisedRequest<YouTubeVideoDetailsList>(requestParams)),
            TO.fromTaskEither,
            TO.map((result: RequestSuccess) => result.getData() as YouTubeVideoDetailsList)
          )
        }
    }
}