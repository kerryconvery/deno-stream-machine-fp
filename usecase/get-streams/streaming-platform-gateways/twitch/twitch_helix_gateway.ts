import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as R from "https://esm.sh/fp-ts@2.13.1/Record";
import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { RequestFailure, RequestParams, RequestSuccess, RequestMethod } from "../../../shared/fetch_request.ts";
import { TwitchStreams, TwitchUser } from "../../stream-providers/twitch.ts";
import { removeNoneParams } from "../../../shared/fp_utils.ts";

export type TwitchUsers = {
  data: TwitchUser[],
}

export type TwitchHelixGatewayParams = {
  apiUrl: string,
  authorisedRequest: <T>(params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>
}

type TwitchStreamOptions = {
  pageSize: O.Option<number>,
  pageOffset: O.Option<string>
}

export interface TwitchHelixGateway {
  getStreams: (options: TwitchStreamOptions) => () => TO.TaskOption<TwitchStreams>,
  getUsersById: (userIds: string[]) => T.Task<TwitchUser[]>
}

export function createTwitchHelixGateway({ apiUrl, authorisedRequest }: TwitchHelixGatewayParams): TwitchHelixGateway {
  return {
    getStreams: ({ pageSize, pageOffset }: TwitchStreamOptions) => (): TO.TaskOption<TwitchStreams> => {
      return pipe(
        TE.Do,
        TE.bind('url', () => TE.right(`${apiUrl}/helix/streams`)),
        TE.bind('method', () => TE.right('GET' as RequestMethod)),
        TE.bind('headers', () => TE.right(O.none)),
        TE.bind('queryParams', () => TE.right(pipe(
          {
            first: O.alt(() => O.some(20))(pageSize),
            after: pageOffset,
          },
          removeNoneParams,
        ))),
        TE.bind('body', () => TE.right(O.none)),
        TE.chain((requestParams) => {
          return authorisedRequest<TwitchStreams>(requestParams)
        }),
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
        TE.chain((requestParams) => {
          return authorisedRequest<TwitchUsers>(requestParams)
        }),
        TE.fold(
          () => T.of([]),
          (result: RequestSuccess) => T.of((result.getData() as TwitchUsers).data)
        )
      )
    }
  }
}

function joinUserIds(userIds: string[]): string {
  return userIds.map(id => `id=${id}`).join("&")
}