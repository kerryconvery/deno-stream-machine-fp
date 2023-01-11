import { Maybe } from "../../shared/functors/maybe.ts";
import { request } from "../../shared/rest_client.ts";
import { fork } from "../../shared/functors/fork.ts";

export type TwitchAuthHeaders = {
  'Client-Id': string;
  'Authorization': string;
}

export type TwitchAuthorizer = () => Promise<TwitchAuthHeaders>;

type TwitchAuthResponse = {
  access_token: string,
  expires_in: number,
  token_type: string,
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