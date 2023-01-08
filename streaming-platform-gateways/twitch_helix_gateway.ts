import { get, post } from "./rest-client.ts";
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

type Requester<T> = (headers: Record<string, string>) => Promise<T>;
type Authorizer = <T>(requester: Requester<T>) => Promise<T>;

type TwitchHelixGatewayParams = {
  apiUrl: string,
  withAuthToken: Authorizer
}

export function createTwitchHelixGateway({ apiUrl, withAuthToken }: TwitchHelixGatewayParams) {    
  return {
    getStreams: (): Promise<TwitchStreams> => {
      return withAuthToken((headers: Record<string, string>) => {
        return get<TwitchStreams>({
          url: `${apiUrl}/helix/streams`,
          headers,
        })
      });
    },

    getUsersById: (userIds: string[]): Promise<TwitchUser[]> => {
      return withAuthToken((headers: Record<string, string>) => {
        return get<TwitchUsers>({
          url: `${apiUrl}/helix/users?${joinUserIds(userIds)}`,
          headers,
        }).then(users => users.data)
      });
    }
  }
}


function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}

export function createAuthorizer(authUrl: string, clientId: string, clientSecret: string): Authorizer {
  let authToken: Maybe<string> = Maybe.None();
  
  return async function<T>(requestFunction: Requester<T>): Promise<T> {
    if (authToken.isNone()) {
      authToken = Maybe.Some(await getAuthToken(authUrl, clientId, clientSecret));
    }

    return requestFunction({
      'Client-Id': clientId,
      'Authorization': `Bearer ${authToken.getValue("")}`,
    })
  }
}

function getAuthToken(authUrl: string, clientId: string, clientSecret: string): Promise<string> {
  return post<TwitchAuthResponse>({
    url: `${authUrl}/oauth2/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  })
  .then((data: TwitchAuthResponse) => {
    return data.access_token
  })
}
