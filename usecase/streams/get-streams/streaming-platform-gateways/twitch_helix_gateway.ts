import { request } from "./rest_client.ts";
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
}

export type TwitchStreams = {
  data: TwitchStream[],
  pagination: {
    cursor?: string
  }
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
  authUrl: string,
  clientId: string,
  clientSecret: string,
}

export function createTwitchHelixGateway(gatewayParams: TwitchHelixGatewayParams) {
  const performRequest = createGetRequester(gatewayParams);

  return {
    getStreams: (): Promise<TwitchStreams> => {
      return performRequest<TwitchStreams>(`/helix/streams`);
    },

    getUsersById: (userIds: string[]): Promise<TwitchUser[]> => {
      return performRequest<TwitchUsers>(`/helix/users?${joinUserIds(userIds)}`)
        .then((users: TwitchUsers) => {
          return users.data
        })
    }
  }
}

const createGetRequester = ({ apiUrl, authUrl, clientId, clientSecret }: TwitchHelixGatewayParams) => {
  const getAuthHeaders = createAuthorizer(authUrl, clientId, clientSecret);

  return <T>(endpoint: string) => {
    return getAuthHeaders()
      .then((headers: TwitchAuthHeaders) => {
        return request<T>({
          url: `${apiUrl}${endpoint}`,
          method: 'GET',
          headers
        })
      })
    }
}

function createAuthorizer(authUrl: string, clientId: string, clientSecret: string): TwitchAuthorizer {
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
  return request<TwitchAuthResponse>({
    url: `${authUrl}/oauth2/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  })
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

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}