import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import * as TO from "https://esm.sh/fp-ts@2.13.1/TaskOption";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { RequestFailure, RequestSuccess, UnsupportedError } from "../../../../shared/fetch_request.ts";
import { createTwitchHelixGateway, TwitchHelixGateway } from "../twitch_helix_gateway.ts";
import { TwitchStreams } from "../../../stream-providers/twitch.ts";

Deno.test("Twitch gateway", async (test) => {
  await test.step("Given that the request to the twitch service is successful it will return back a list of streams", async () => {
    const twitchStreams = {
      data: [
        {
          id: 'stream1',
          title: 'God of war',
          user_id: '1',
          user_login: 'streamer1',
          thumbnail_url: 'thumbnail',
          viewer_count: 10,
          isLive: true,
        }
      ],
      pagination: {
        cursor: '3'
      }
    };
    const twitchGateway = makeMockGateway(TE.right(new RequestSuccess(twitchStreams)));
    
    const streams = await pipe(
        twitchGateway.getStreams(),
        TO.getOrElse(() => T.of<TwitchStreams>({ data: [], pagination: { cursor: '' } })),
    )()

    assertEquals(streams, twitchStreams);
  })

  await test.step("Given that the request to the twitch service fails it will return no streams", async () => {
    const twitchGateway = makeMockGateway(TE.left(new UnsupportedError()));
    
    const streams = await pipe(
        twitchGateway.getStreams(),
        TO.getOrElse(() => T.of<TwitchStreams>({ data: [], pagination: { cursor: '' } })),
    )()

    assertEquals(streams, { data: [], pagination: { cursor: '' } });
  })

  await test.step("Given that the request to the twitch service succeeds it will return a list of users", async () => {
    const twitchUsers = [
      {
        id: '1',
        display_name: 'streamer1',
        profile_image_url: 'profile_image1',
      },
      {
        id: '2',
        display_name: 'streamer2',
        profile_image_url: 'profile_image2',
      }
    ];
    const twitchGateway = makeMockGateway(TE.right(new RequestSuccess({ data: twitchUsers })));
    
    const users = await twitchGateway.getUsersById([])();

    assertEquals(users, twitchUsers);
  })

  await test.step("Given that the request to the twitch service fails it will return no users", async () => {
    const twitchGateway = makeMockGateway(TE.left(new UnsupportedError()));

    const users = await twitchGateway.getUsersById([])();

    assertEquals(users, []);
  })

  function makeMockGateway(result: TE.TaskEither<RequestFailure, RequestSuccess>): TwitchHelixGateway {
    return createTwitchHelixGateway({ apiUrl: '', authorisedRequest: () => result });
  }
})