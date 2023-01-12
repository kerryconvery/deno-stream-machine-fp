import { request } from "/usecase/shared/rest_client.ts";
import { createAuthorizer, TwitchAuthHeaders } from "./authorisation.ts";
import { TwitchStreams,TwitchUser,TwitchUsers } from "/usecase/get-streams/services/twitch/streams_service.ts";

type TwitchHelixGatewayParams = {
  apiUrl: string,
  authUrl: string,
  clientId: string,
  clientSecret: string,
}

export function createTwitchHelixGateway(gatewayParams: TwitchHelixGatewayParams) {
  const authenticatedRequest = createAuthenticatedRequester(gatewayParams);

  return {
    getStreams: (): Promise<TwitchStreams> => {
      return authenticatedRequest<TwitchStreams>(`/helix/streams`);
    },

    getUsersById: (userIds: string[]): Promise<TwitchUser[]> => {
      return authenticatedRequest<TwitchUsers>(`/helix/users?${joinUserIds(userIds)}`)
        .then((users: TwitchUsers) => {
          return users.data
        })
    }
  }
}

const createAuthenticatedRequester = ({ apiUrl, authUrl, clientId, clientSecret }: TwitchHelixGatewayParams) => {
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