import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { RequestFailure, RequestSuccess, UnsupportedError } from "../../../../shared/fetch_request.ts";
import { createTwitchHelixGateway } from "../twitch_helix_gateway.ts";
import { assertSpyCall, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import { TwitchUser } from "../../../services/twitch.ts";

Deno.test("Twitch gateway", async (test) => {
  await test.step("Given a request for streams it will call the twitch service", async () => {
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
    };

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(twitchStreams)));
    
    const streams = await twitchGateway.getStreams({ pageSize: 8 })([])()

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/streams',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          { 
            first: 8,
          }
        )
      }]
    });

    assertEquals(streams, O.some(twitchStreams));
  });

  await test.step("Given a list of category ids it will include those in the request for streams", async () => {
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

    const categories = ['category-1', 'category-2'];

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(twitchStreams)));
    
    await twitchGateway.getStreams({ pageSize: 8 })(categories)()

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/streams',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          {
            game_id: 'category-1&game_id=category-2',
            first: 8
          }
        )
      }]
    });
  })

  await test.step("Given that the request to the twitch service fails it will return no streams", async () => {
    const { twitchGateway } = makeMockGateway(TE.left(new UnsupportedError()));
    
    const streams = await twitchGateway.getStreams({ pageSize: 8 })([])()

    assertEquals(O.isNone(streams), true);
  })

  await test.step("Given a request for users by id it willl call the twitch service", async () => {
    const twitchUsers: TwitchUser[] = [];
    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess({ data: twitchUsers })));
    
    await twitchGateway.getUsersById(['1','2','3'])();

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/users?id=1&id=2&id=3',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.none
      }]
    });
  });

  await test.step("Given that the request to the twitch service succeeds it will return a list of users", async () => {
    const twitchUsers = [
      {
        id: 'user-1',
        display_name: 'streamer1',
        profile_image_url: 'profile_image1',
      },
      {
        id: 'user-2',
        display_name: 'streamer2',
        profile_image_url: 'profile_image2',
      }
    ];
    const { twitchGateway } = makeMockGateway(TE.right(new RequestSuccess({ data: twitchUsers })));
    
    const users = await twitchGateway.getUsersById(['user-1', 'user-2'])();

    assertEquals(users, twitchUsers);
  })

  await test.step("Given that the request to the twitch service fails it will return no users", async () => {
    const { twitchGateway } = makeMockGateway(TE.left(new UnsupportedError()));

    const users = await twitchGateway.getUsersById(['user-1', 'user-2'])();

    assertEquals(users, []);
  })

  await test.step("Given a request for categories it will call the twitch service", async () => {
    const twitchCategories = {
      data: [
      {
        id: 'category-1',
      },
      {
        id: 'category-2',
      }
    ]}

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(twitchCategories)));
    
    await twitchGateway.searchCategories( { pageSize: 10, pageOffset: O.none })('search term')();

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/search/categories',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          {
            query: "search%20term",
            first: 10,
          }
        )   
      }]
    });
  });

  await test.step("Given a request for categories with a page offset it will include the page offset in the request", async () => {
    const twitchCategories = {
      data: [
      {
        id: 'category-1',
      },
      {
        id: 'category-2',
      }
    ]}

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(twitchCategories)));
    
    await twitchGateway.searchCategories( { pageSize: 10, pageOffset: O.some('abc123') })('search term')();

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/search/categories',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          { 
            query: "search%20term",
            first: 10,
            after: 'abc123',
          }
        )   
      }]
    });
  });

  await test.step("Given that the request to the twitch service succeeds it will return a list of categories", async () => {
    const twitchCategories = {
      data: [
      {
        id: 'category-1',
      },
      {
        id: 'category-2',
      }
    ]}

    const { twitchGateway } = makeMockGateway(TE.right(new RequestSuccess(twitchCategories)));
    
    const categories = await twitchGateway.searchCategories({ pageSize: 10, pageOffset: O.none })('search-term')();

    assertEquals(categories, O.some(twitchCategories));
  })

  await test.step("Given that the request to the twitch service fails it will return no categories", async () => {
    const { twitchGateway } = makeMockGateway(TE.left(new UnsupportedError()));
    
    const categories = await twitchGateway.searchCategories({ pageSize: 10, pageOffset: O.none })('search-term')();

    assertEquals(O.isNone(categories), true);
  })

  await test.step("Given a request for the top games it will call the twitch service", async () => {
    const expectedTopGames = {
      data: [
      {
        id: 'game-1',
      },
      {
        id: 'game-2',
      }
    ]}

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(expectedTopGames)));
    
    const topGames = await twitchGateway.getTopGames({ pageSize: 10, pageOffset: O.none })()();

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/games/top',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          { 
            first: 10,
          }
        )      
      }]
    });

    assertEquals(topGames, O.some(expectedTopGames))
  })

  await test.step("Given a request for the next page of top games it will call the twitch service with a page token", async () => {
    const expectedTopGames = {
      data: [
      {
        id: 'game-3',
      },
      {
        id: 'game-4',
      }
    ]}

    const { twitchGateway, request } = makeMockGateway(TE.right(new RequestSuccess(expectedTopGames)));
    
    await twitchGateway.getTopGames({ pageSize: 10, pageOffset: O.some('abc1234') })()();

    assertSpyCall(request, 0, { args: [
      {
        url: 'https://api.twitch.com/helix/games/top',
        method: 'GET',
        headers: O.none,
        body: O.none,
        queryParams: O.some(
          { 
            first: 10,
            after: 'abc1234',
          }
        )      
      }]
    });
  })

  await test.step("Given that the request for top games fails it will return no games", async () => {
    const { twitchGateway } = makeMockGateway(TE.left(new UnsupportedError()));
    
    const topGames = await twitchGateway.getTopGames({ pageSize: 10, pageOffset: O.some('abc1234') })()();

    assertEquals(O.isNone(topGames), true);
  })

  function makeMockGateway(result: TE.TaskEither<RequestFailure, RequestSuccess>) {
    const request = spy(() => result);
    const twitchGateway = createTwitchHelixGateway({ apiUrl: 'https://api.twitch.com', authorisedRequest: request });

    return { twitchGateway, request };
  }
})