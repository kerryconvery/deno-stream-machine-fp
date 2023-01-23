import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { PlatformStreams } from "./types.ts";

export type TwitchStream = {
  id: string,
  user_id: string,
  user_login: string,
  title: string,
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

interface GetTwitchPlatformStreams {
  getTwitchStreams: () => TO.TaskOption<TwitchStreams>;
  getTwitchUsersByIds: (userIds: string[]) => T.Task<TwitchUser[]>;
  mapTwitchStreamsToPlatformStreams: (twitchStreams: TwitchStreams, twitchStreamers: TwitchUser[]) => PlatformStreams;
}

export const getTwitchPlatformStreams = ({
  getTwitchStreams,
  getTwitchUsersByIds,
  mapTwitchStreamsToPlatformStreams,
}: GetTwitchPlatformStreams) => (): TO.TaskOption<PlatformStreams> => {
  return pipe(
    TO.Do,
    TO.bind("twitchStreams", getTwitchStreams),
    TO.bind("twitchStreamerIds", ({ twitchStreams }) => TO.of(extractStreamerIds(twitchStreams.data))),
    TO.bind("twitchStreamers", ({ twitchStreamerIds }) => TO.fromTask(getTwitchUsersByIds(twitchStreamerIds))),
    TO.map(({ twitchStreams, twitchStreamers }) => mapTwitchStreamsToPlatformStreams(twitchStreams, twitchStreamers))
  );
}

const extractStreamerIds = (twitchStreams: TwitchStream[]): string[] => {
  return twitchStreams.map((stream: TwitchStream) => stream.user_id)
}
