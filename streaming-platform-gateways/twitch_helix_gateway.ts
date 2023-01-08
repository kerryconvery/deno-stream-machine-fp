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

export class TwitchHelixGateway {
  private _apiUrl: string;
  private _clientId: string;
  private _clientSecret: string;
  private _authUrl: string;
  private _authToken: Maybe<string> = Maybe.None()
  
  constructor(authurl: string, apiUrl: string, clientId: string, clientSecret: string) {
    this._apiUrl = apiUrl;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._authUrl = authurl;
  }
  
  getStreams(): Promise<TwitchStreams> {
    return this.withAuthToken((headers: Record<string, string>) => {
      return get<TwitchStreams>({
        url: `${this._apiUrl}/helix/streams`,
        headers,
      })
    });
  }

  getUsersById(userIds: string[]): Promise<TwitchUser[]> {
    return this.withAuthToken((headers: Record<string, string>) => {
      return get<TwitchUsers>({
        url: `${this._apiUrl}/helix/users?${this.joinUserIds(userIds)}`,
        headers,
      }).then(users => users.data)
    });
  }

  private joinUserIds(userIds: string[]): string {
    return userIds.map(id => `id=${id}`).join("&")
  }

  private async withAuthToken<T>(requestFunction: (headers: Record<string, string>) => Promise<T>): Promise<T> {
    if (this._authToken.isNone()) {
      await this.refreshAuthToken();
    }
 
    return requestFunction({
      'Client-Id': this._clientId,
      'Authorization': `Bearer ${this._authToken.getValue("")}`,
    })
  }

  private refreshAuthToken(): Promise<void> {
    return this.getAuthToken()
      .then((authToken: string) => {
        this._authToken = Maybe.Some(authToken)
      })
  }

  private getAuthToken(): Promise<string> {
    return post<TwitchAuthResponse>({
      url: `${this._authUrl}/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${this._clientId}&client_secret=${this._clientSecret}&grant_type=client_credentials`
    })
    .then((data: TwitchAuthResponse) => {
      return data.access_token
    })
  }
}