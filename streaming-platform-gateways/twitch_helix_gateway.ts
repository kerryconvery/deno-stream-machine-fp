import { get } from "./rest-client.ts";

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
  nextPageOffset: number
}

export type TwitchUser = {
  id: string,
  display_name: string,
  profile_image_url: string,
}

export class TwitchHelixGateway {
  private _apiUrl: string;
  
  constructor(apiUrl: string) {
    this._apiUrl = apiUrl
  }
  
  getStreams(): Promise<TwitchStreams> {
    return get<TwitchStreams>(`${this._apiUrl}\\streams`);
  }

  getUsersById(userIds: string[]): Promise<TwitchUser[]> {
    return get<TwitchUser[]>(`${this._apiUrl}\\users?${this.joinUserIds(userIds)}`)
  }

  private joinUserIds(userIds: string[]): string {
    return userIds.map(id => `id=${id}`).join("&")
  }
}