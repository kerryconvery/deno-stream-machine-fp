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
  getStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>;
  getUsersByIds: (userIds: string[]) => T.Task<TwitchUser[]>;
  searchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>;
  mapStreamsToPlatformStreams: (twitchStreams: TwitchStreams, twitchStreamers: TwitchUser[]) => PlatformStreams;
}

export const getTwitchPlatformStreams = ({
  getStreams,
  getUsersByIds,
  searchCategories,
  mapStreamsToPlatformStreams,
}: GetTwitchPlatformStreams): StreamProvider => (searchTerm: O.Option<string>): TO.TaskOption<PlatformStreams> => {
  return pipe(
    TO.Do,
    TO.bind("twitchStreams", () => searchStreams(getStreams, searchCategories)(searchTerm)),
    TO.bind("twitchStreamerIds", ({ twitchStreams }) => TO.of(extractStreamerIds(twitchStreams.data))),
    TO.bind("twitchStreamers", ({ twitchStreamerIds }) => TO.fromTask(getUsersByIds(twitchStreamerIds))),
    TO.map(({ twitchStreams, twitchStreamers }) => mapStreamsToPlatformStreams(twitchStreams, twitchStreamers))
  );
}

const searchStreams = (
  getStreams: (categoryIds: string[]) => TO.TaskOption<TwitchStreams>,
  searchCategories: (searchTerm: string) => TO.TaskOption<TwitchCategories>,
) => {
  return O.match(
    () => getStreams([]),
    (term: string) => pipe(
      term,
      searchCategories,
      TO.map(extractCategoryIds),
      TO.chain(getStreams)
    )
  )
}

const extractStreamerIds = (twitchStreams: TwitchStream[]): string[] => {
  return twitchStreams.map((stream: TwitchStream) => stream.user_id)
}

const extractCategoryIds = (twichCategories: TwitchCategories): string[] => {
  return twichCategories.data.map((category: TwitchCategory) => category.id)
}