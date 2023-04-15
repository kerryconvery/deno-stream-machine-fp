import { Router } from "https://deno.land/x/oak/mod.ts";
import * as O from  "https://esm.sh/fp-ts@2.13.1/Option";
import { mapTwitchStreamsToPlatformStreams } from "/usecase/get-streams/mappers/twitch/twitch_helix_stream_mappers.ts";
import { getTwitchPlatformStreams } from "/usecase/get-streams/services/twitch.ts";
import { StreamProvider } from "/usecase/get-streams/services/types.ts";
import { twitchRequestAuthoriser } from "/usecase/get-streams/streaming-platform-gateways/twitch/request_authoriser.ts";
import { createTwitchHelixGateway } from "/usecase/get-streams/streaming-platform-gateways/twitch/twitch_helix_gateway.ts";
import { fetchRequest } from "/usecase/shared/fetch_request.ts";
import { twitchAuthenticatedRequest } from "/usecase/get-streams/streaming-platform-gateways/twitch/authenticated_request.ts";
import { getYouTubePlatformStreams } from "../usecase/get-streams/services/youtube.ts";
import { createYouTubeV3Gateway } from "../usecase/get-streams/streaming-platform-gateways/youtube/youtube_v3_gateway.ts";
import { youtubeAuthorizedRequest } from "../usecase/get-streams/streaming-platform-gateways/youtube/youtube_v3_authorized_request.ts";
import { mapYouTubeV3VideosToPlatformStreams } from "../usecase/get-streams/mappers/youtube/youtube_v3_video_mapper.ts";

export const router = new Router();

const twitchGateway = getTwitchGateway();
const youtubeGateway = getYouTubeGateway();

export interface SearchParams {
  pageSize: number;
  pageOffsets: Record<string, string>,
  searchTerm: O.Option<string>,
}

export function createStreamProviders(parameters: SearchParams): StreamProvider[] {
  return [
    createTwitchStreamProvider(parameters.pageSize, parameters.pageOffsets),
    createYouTubeStreamProvider(parameters.pageSize, parameters.pageOffsets)
  ];
}

function createTwitchStreamProvider(pageSize: number, pageOffsets: Record<string, string>): StreamProvider {  
  return getTwitchPlatformStreams({
    getCategories: twitchGateway.getTopGames({ pageSize, pageOffset: O.fromNullable(pageOffsets['twitch']) }),
    getStreams: twitchGateway.getStreams({ pageSize }),
    getUsersByIds: twitchGateway.getUsersById,
    searchCategories: twitchGateway.searchCategories({ pageSize, pageOffset: O.fromNullable(pageOffsets['twitch']) }),
    mapStreamsToPlatformStreams: mapTwitchStreamsToPlatformStreams
  });
}

function createYouTubeStreamProvider(pageSize: number, pageOffsets: Record<string, string>): StreamProvider {
  return getYouTubePlatformStreams({
    searchVideos: youtubeGateway.searchVideos({ pageSize, pageOffset: O.fromNullable(pageOffsets['youtube']) }),
    getVideoChannelByChannelIds: youtubeGateway.getChannelsById,
    getVideoDetailsByVideoIds: youtubeGateway.getVideosById,
    mapVideosToPlatformStreams: mapYouTubeV3VideosToPlatformStreams(Deno.env.get("YOUTUBE_VIDEO_URL") ?? ''),
  })
}

function getTwitchGateway() {
  const request = fetchRequest(fetch);

  const authorisedRequest = twitchRequestAuthoriser({
    authUrl: Deno.env.get("TWITCH_AUTH_URL") ?? '',
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET") ?? '',
    request, 
  })

  const twitchClient = twitchAuthenticatedRequest({
    clientId: Deno.env.get("TWITCH_CLIENT_ID") ?? '',
    getAccessToken: authorisedRequest,
    request,
  })

  return createTwitchHelixGateway({
    apiUrl: Deno.env.get("TWITCH_API_URL") ?? '',
    authorisedRequest: twitchClient
  })
}

function getYouTubeGateway() {
  const authorisedRequest = youtubeAuthorizedRequest({
    apiKey: Deno.env.get("YOUTUBE_API_KEY") ?? '',
    request: fetchRequest(fetch)
  });

  return createYouTubeV3Gateway({
    apiUrl: Deno.env.get("YOUTUBE_API_URL") ?? '',
    authorisedRequest,
  })
}

