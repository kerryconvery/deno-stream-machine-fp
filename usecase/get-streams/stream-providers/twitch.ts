import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { PlatformStreams, StreamProvider } from "./types.ts";

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

export type TwitchCategory = {
  id: string,
}

export type TwitchCategories = {
  data: TwitchCategory[],
}

interface GetTwitchPlatformStreams {
  getTwitchStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>;
  getTwitchUsersByIds: (userIds: string[]) => T.Task<TwitchUser[]>;
  searchTwitchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>;
  mapTwitchStreamsToPlatformStreams: (twitchStreams: TwitchStreams, twitchStreamers: TwitchUser[]) => PlatformStreams;
}

export const getTwitchPlatformStreams = ({
  getTwitchStreams,
  getTwitchUsersByIds,
  searchTwitchCategories,
  mapTwitchStreamsToPlatformStreams,
}: GetTwitchPlatformStreams): StreamProvider => (searchTerm: O.Option<string>): TO.TaskOption<PlatformStreams> => {
  return pipe(
    TO.Do,
    TO.bind("twitchStreams", () => searchStreams(getTwitchStreams, searchTwitchCategories)(searchTerm)),
    TO.bind("twitchStreamerIds", ({ twitchStreams }) => TO.of(extractStreamerIds(twitchStreams.data))),
    TO.bind("twitchStreamers", ({ twitchStreamerIds }) => TO.fromTask(getTwitchUsersByIds(twitchStreamerIds))),
    TO.map(({ twitchStreams, twitchStreamers }) => mapTwitchStreamsToPlatformStreams(twitchStreams, twitchStreamers))
  );
}

const searchStreams = (
  getTwitchStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>,
  searchTwitchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>,
) => {
  return O.match(
    () => getTwitchStreams([]),
    (term: string) => pipe(
      term,
      searchTwitchCategories,
      TO.map(extractCategoryIds),
      TO.chain(getTwitchStreams)
    )
  )
}

const extractStreamerIds = (twitchStreams: TwitchStream[]): string[] => {
  return twitchStreams.map((stream: TwitchStream) => stream.user_id)
}

const extractCategoryIds = (twichCategories: TwitchCategories): string[] => {
  return twichCategories.data.map((category: TwitchCategory) => category.id)
}