import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import { request } from "/usecase/shared/rest_client.ts";
import { createAuthorizer, TwitchAuthHeaders } from "./authorisation.ts";
import { TwitchStreams,TwitchUser } from "../../stream-providers/twitch.ts";

type TwitchUsers = {
  data: TwitchUser[],
}

type TwitchHelixGatewayParams = {
  apiUrl: string,
  authUrl: string,
  clientId: string,
  clientSecret: string,
}

export function createTwitchHelixGateway(gatewayParams: TwitchHelixGatewayParams) {
  const authenticatedRequest = createAuthenticatedRequester(gatewayParams);

  return {
    getStreams: (): TO.TaskOption<TwitchStreams> => {
      return () =>  authenticatedRequest<TwitchStreams>(`/helix/streams`)
        .then((streams: TwitchStreams) => {
          return O.some(streams)
        })
        .catch(() => {
          return O.none
        })
    },

    getUsersById: (userIds: string[]): T.Task<TwitchUser[]> => {
      return () => authenticatedRequest<TwitchUsers>(`/helix/users?${joinUserIds(userIds)}`)
        .then((users: TwitchUsers) => {
          return users.data
        })
        .catch(() => [])
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