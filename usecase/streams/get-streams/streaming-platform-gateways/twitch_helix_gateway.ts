import { Request } from "./rest_client.ts";
import { Maybe } from '../shared/functors/maybe.ts';
import { fork } from "../shared/functors/fork.ts";

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
          return createGetRequest<TwitchStreams>(`${apiUrl}/helix/streams`, headers)
        })
    },

    getUsersById: (userIds: string[]): Promise<TwitchUser[]> => {
      return getAuthHeaders()
        .then((headers: TwitchAuthHeaders) => {
          return createGetRequest<TwitchUsers>(`${apiUrl}/helix/users?${joinUserIds(userIds)}`, headers)
        })
        .then((users) => {
          return users.data
        })
    }
  }
}

function createGetRequest<T>(url: string, headers: TwitchAuthHeaders) {
  return Request
   .createGetRequest(url)
   .setHeaders(headers)
   .request<T>()
}

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}

export function createAuthorizer(authUrl: string, clientId: string, clientSecret: string): TwitchAuthorizer {
  const getAuthToken = createAuthTokenCache(() => getNewAuthToken(authUrl, clientId, clientSecret))
  
  return function(): Promise<TwitchAuthHeaders> {
    return getAuthToken()
      .then((authToken: string) => {
        return mapToAuthHeaders(clientId, authToken)
      })
  }
}

function mapToAuthHeaders(clientId: string, authToken: string) {
  return {
    'Client-Id': clientId,
    'Authorization': `Bearer ${authToken}`,
  }
}

function getNewAuthToken(authUrl: string, clientId: string, clientSecret: string): Promise<string> {
  return Request
    .createPostRequest(`${authUrl}/oauth2/token`)
    .setHeader('Content-Type', 'application/x-www-form-urlencoded')
    .setBody(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
    .request<TwitchAuthResponse>()
    .then((data: TwitchAuthResponse) => {
      return data.access_token
    })
}

function createAuthTokenCache(getAuthToken: () => Promise<string>) {
  let authToken: Maybe<string> = Maybe.None();
  
  return function(): Promise<string> {
    return fork({
      condition: authToken.isSome(),
      left: () => {
        return getAuthToken()
          .then((token: string) => {
            authToken = Maybe.Some(token);
            return token;
          })
      },
      right: () => {
        return Promise.resolve(authToken.getValue(""))
      }
    })
  }
}