import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { RequestFailure, RequestParams, RequestSuccess } from "../../../shared/fetch_request.ts";
import { TwitchStreams, TwitchUser } from "../../stream-providers/twitch.ts";
import { pipe } from "https://esm.sh/v103/fp-ts@2.13.1/lib/function";

export type TwitchUsers = {
  data: TwitchUser[],
}

export type TwitchHelixGatewayParams = {
  apiUrl: string,
  authorisedRequest: <T>(params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess>
}

export interface TwitchHelixGateway {
  getStreams: () => TO.TaskOption<TwitchStreams>,
  getUsersById: (userIds: string[]) => T.Task<TwitchUser[]>
}

export function createTwitchHelixGateway({ apiUrl, authorisedRequest }: TwitchHelixGatewayParams): TwitchHelixGateway {
  return {
    getStreams: (): TO.TaskOption<TwitchStreams> => {
      const requestParams: RequestParams = {
        url: `${apiUrl}/helix/streams`,
        method: 'GET',
        headers: O.none,
        body: O.none,
      };

      return pipe(
        authorisedRequest<TwitchStreams>(requestParams),
        TO.fromTaskEither,
        TO.map((result: RequestSuccess) => result.getData() as TwitchStreams)
      )
    },

    getUsersById: (userIds: string[]): T.Task<TwitchUser[]> => {
      const requestParams: RequestParams = {
        url: `${apiUrl}/helix/users?${joinUserIds(userIds)}`,
        method: 'GET',
        headers: O.none,
        body: O.none,
      };

      return pipe(
        authorisedRequest<TwitchUsers>(requestParams),
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