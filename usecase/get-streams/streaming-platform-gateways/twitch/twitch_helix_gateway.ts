import { request } from "/usecase/shared/rest_client.ts";
import { createAuthorizer, TwitchAuthHeaders } from "./authorisation.ts";

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

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}