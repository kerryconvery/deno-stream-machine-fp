import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { encodeUrl } from "https://deno.land/x/encodeurl/mod.ts";
import { RequestFailure, RequestParams, RequestSuccess, RequestMethod } from "../../../shared/fetch_request.ts";
import { TwitchCategories, TwitchStreams, TwitchUser } from "../../services/twitch.ts";
import { removeNoneParams } from "../../../shared/fp_utils.ts";

export type TwitchUsers = {
  data: TwitchUser[],
}

export type TwitchHelixGatewayParams = {
  apiUrl: string,
  authorisedRequest: <T>(params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>
}

type TwitchStreamOptions = {
  pageSize: number,
}

type TwitchCategorySearchOptions = {
  pageSize: number,
  pageOffset: O.Option<string>
}

type TwitchTopGamesOptions = {
  pageSize: number,
  pageOffset: O.Option<string>
}

export interface TwitchHelixGateway {
  getStreams: (options: TwitchStreamOptions) => (categories: string[]) => TO.TaskOption<TwitchStreams>,
  getUsersById: (userIds: string[]) => T.Task<TwitchUser[]>,
  searchCategories: ({ pageSize, pageOffset }: TwitchCategorySearchOptions) => (searchTerm: string) => TO.TaskOption<TwitchCategories>,
  getTopGames: (options: TwitchTopGamesOptions) => () => TO.TaskOption<TwitchCategories>
}

export function createTwitchHelixGateway({ apiUrl, authorisedRequest }: TwitchHelixGatewayParams): TwitchHelixGateway {
  return {
    getStreams: ({ pageSize }: TwitchStreamOptions) => (categories: string[]): TO.TaskOption<TwitchStreams> => {
      return pipe(
        TE.Do,
        TE.bind('url', () => TE.right(`${apiUrl}/helix/streams`)),
        TE.bind('method', () => TE.right('GET' as RequestMethod)),
        TE.bind('headers', () => TE.right(O.none)),
        TE.bind('queryParams', () => TE.right(pipe(
          {
            'game_id': joinCategories(categories),
            first: O.some(pageSize),
          },
          removeNoneParams,
        ))),
        TE.bind('body', () => TE.right(O.none)),
        TE.chain((requestParams) => authorisedRequest<TwitchStreams>(requestParams)),
        TO.fromTaskEither,
        TO.map((result: RequestSuccess) => result.getData() as TwitchStreams)
      )
    },

    getUsersById: (userIds: string[]): T.Task<TwitchUser[]> => {
      return pipe(
        TE.Do,
        TE.bind('url', () => TE.right(`${apiUrl}/helix/users?${joinUserIds(userIds)}`)),
        TE.bind('method', () => TE.right('GET' as RequestMethod)),
        TE.bind('headers', () => TE.right(O.none)),
        TE.bind('queryParams', () => TE.right(O.none)),
        TE.bind('body', () => TE.right(O.none)),
        TE.chain((requestParams) => authorisedRequest<TwitchUsers>(requestParams)),
        TE.fold(
          () => T.of([]),
          (result: RequestSuccess) => T.of((result.getData() as TwitchUsers).data)
        )
      )
    },

    searchCategories: ({ pageSize, pageOffset }: TwitchCategorySearchOptions) => (searchTerm: string): TO.TaskOption<TwitchCategories> => {
      return pipe(
        TE.Do,
        TE.bind('url', () => TE.right(`${apiUrl}/helix/search/categories`)),
        TE.bind('method', () => TE.right('GET' as RequestMethod)),
        TE.bind('headers', () => TE.right(O.none)),
        TE.bind('queryParams', () => TE.right(pipe(
          {
            query: O.some(encodeUrl(searchTerm)),
            first: O.some(pageSize),
            after: pageOffset
          },
          removeNoneParams,
        ))),
        TE.bind('body', () => TE.right(O.none)),
        TE.chain((requestParams) => authorisedRequest<TwitchUsers>(requestParams)),
        TO.fromTaskEither,
        TO.map((result: RequestSuccess) => result.getData() as TwitchCategories)
      )
    },

    getTopGames: ({ pageSize, pageOffset }: TwitchTopGamesOptions) => (): TO.TaskOption<TwitchCategories> => {
      return pipe(
        TE.Do,
        TE.bind('url', () => TE.right(`${apiUrl}/helix/games/top`)),
        TE.bind('method', () => TE.right('GET' as RequestMethod)),
        TE.bind('headers', () => TE.right(O.none)),
        TE.bind('queryParams', () => TE.right(pipe(
          {
            first: O.some(pageSize),
            after: pageOffset
          },
          removeNoneParams,
        ))),
        TE.bind('body', () => TE.right(O.none)),
        TE.chain((requestParams) => authorisedRequest<TwitchUsers>(requestParams)),
        TO.fromTaskEither,
        TO.map((result: RequestSuccess) => result.getData() as TwitchCategories)
      )
    }
  }
}

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}

function joinCategories(categories: string[]): O.Option<string> {
  if (categories.length === 0) {
    return O.none;
  }

  return O.some(categories.join('&game_id='))
}