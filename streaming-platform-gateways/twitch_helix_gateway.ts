import { createGetRequest, createPostRequest, request, RequestOptions } from "./rest-client.ts";
import { Maybe } from '../functors/maybe.ts';

export type TwitchStream = {
  id: string,
  user_id: string,
  title: string,
  game_name: string,
  thumbnail_url: string,
  viewer_count: number,
  isLive: boolean,
  cursor: string
}

export type TwitchStreams = {
  data: TwitchStream[],
  cursor: string,
}

export type TwitchUser = {
  id: string,
  display_name: string,
  profile_image_url: string,
}

export type TwitchUsers = {
  data: TwitchUser[],
}

type TwitchAuthResponse = {
  access_token: string,
  expires_in: number,
  token_type: string,
}

type TwitchAuthHeaders = {
  'Client-Id': string;
  'Authorization': string;
}
type TwitchAuthorizer = () => Promise<TwitchAuthHeaders>;

type TwitchHelixGatewayParams = {
  apiUrl: string,
  getAuthHeaders: TwitchAuthorizer
}

export function createTwitchHelixGateway({ apiUrl, getAuthHeaders }: TwitchHelixGatewayParams) {    
  return {
    getStreams: (): Promise<TwitchStreams> => {
      return getAuthHeaders()
        .then((headers: TwitchAuthHeaders) => {
          return createGetRequest(`${apiUrl}/helix/streams`)
            .setHeaders(headers)
            .build();
        })
        .then((options: RequestOptions) => {
          return request<TwitchStreams>(options)
        })
    },

    getUsersById: (userIds: string[]): Promise<TwitchUser[]> => {
      return getAuthHeaders()
        .then((headers: TwitchAuthHeaders) => {
          return createGetRequest(`${apiUrl}/helix/users?${joinUserIds(userIds)}`)
            .setHeaders(headers)
            .build();
        })
        .then((options: RequestOptions) => {
          return request<TwitchUsers>(options)
        })
        .then((users) => {
          return users.data
        })
    }
  }
}

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}

export function createAuthorizer(authUrl: string, clientId: string, clientSecret: string): TwitchAuthorizer {
  let authToken: Maybe<string> = Maybe.None();
  
  return async function(): Promise<TwitchAuthHeaders> {
    if (authToken.isNone()) {
      authToken = Maybe.Some(await getAuthToken(authUrl, clientId, clientSecret));
    }

    return {
      'Client-Id': clientId,
      'Authorization': `Bearer ${authToken.getValue("")}`,
    }
  }
}

function getAuthToken(authUrl: string, clientId: string, clientSecret: string): Promise<string> {
  return request<TwitchAuthResponse>(
      createPostRequest(`${authUrl}/oauth2/token`)
        .setHeader('Content-Type', 'application/x-www-form-urlencoded')
        .setBody(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
        .build()
  )
  .then((data: TwitchAuthResponse) => {
    return data.access_token
  })
}
