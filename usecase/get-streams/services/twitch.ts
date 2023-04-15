import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe, flow } from "https://esm.sh/fp-ts@2.13.1/function"
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
  pagination: {
    cursor?: string
  }
}

export type PagedTwitchStreams = {
  streams: TwitchStream[],
  pagination: {
    cursor?: string
  }
}

interface GetTwitchPlatformStreams {
  getGames: () => TO.TaskOption<TwitchCategories>;
  getStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>;
  getUsersByIds: (userIds: string[]) => T.Task<TwitchUser[]>;
  searchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>;
  mapStreamsToPlatformStreams: (twitchStreams: PagedTwitchStreams, twitchStreamers: TwitchUser[]) => PlatformStreams;
}

export const getTwitchPlatformStreams = ({
  getGames,
  getStreams,
  getUsersByIds,
  searchCategories,
  mapStreamsToPlatformStreams,
}: GetTwitchPlatformStreams): StreamProvider => (searchTerm: O.Option<string>): TO.TaskOption<PlatformStreams> => {
  return pipe(
    TO.Do,
    TO.bind("pagedTwitchStreams", () => searchStreams(getGames, getStreams, searchCategories)(searchTerm)),
    TO.bind("twitchStreamerIds", ({ pagedTwitchStreams }) => TO.of(extractStreamerIds(pagedTwitchStreams.streams))),
    TO.bind("twitchStreamers", ({ twitchStreamerIds }) => TO.fromTask(getUsersByIds(twitchStreamerIds))),
    TO.map(({ pagedTwitchStreams, twitchStreamers }) => mapStreamsToPlatformStreams(pagedTwitchStreams, twitchStreamers))
  );
}

const searchStreams = (
  getGames: () => TO.TaskOption<TwitchCategories>,
  getStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>,
  searchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>,
) => (searchTerm: O.Option<string>): TO.TaskOption<PagedTwitchStreams> => {
  return pipe(
    TO.Do,
    TO.bind("categories", () => {
      return pipe(
        searchTerm,
        O.match(
          () => getGames(),
          (term: string) => searchCategories(term)
        )
      )
    }),
    TO.bind("categoryIds", ({ categories }) => TO.some(extractCategoryIds(categories))),
    TO.bind("streams", ({ categoryIds }) => getStreams(categoryIds)),
    TO.map(({ categories, streams }) => ({
        streams: streams.data,
        pagination: categories.pagination
      }
    ))
  )
}

const extractStreamerIds = (twitchStreams: TwitchStream[]): string[] => {
  return twitchStreams.map((stream: TwitchStream) => stream.user_id)
}

const extractCategoryIds = (twichCategories: TwitchCategories): string[] => {
  return twichCategories.data.map((category: TwitchCategory) => category.id)
}