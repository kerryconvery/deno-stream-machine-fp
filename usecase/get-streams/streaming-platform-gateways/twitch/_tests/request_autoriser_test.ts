import { assertEquals, } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { assertSpyCall } from "https://deno.land/std@0.172.0/testing/mock.ts";
import { spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { twitchRequestAuthoriser } from "../request_authoriser.ts";
import { RequestFailure,RequestParams,RequestSuccess } from "../../../../shared/fetch_request.ts";

Deno.test("Twitch authoriser", async (test) => {
  const authUrl = "auth_url";
  const clientId = "client_id";
  const clientSecret = "client_secret";

  await test.step("Given client credentials it will return an access token",  async () => {
    const request = spy(() => TE.right(
      new RequestSuccess({
        access_token: "access token",
        expires_in: 1000,
        token_type: "Bearer",
      })
    ));

    const getToken = getTwitchAuthoriser(request)();

    const accessToken = await pipe(
      getToken,
      TE.map((response) => response.getAccessToken()),
      TE.getOrElse(() => T.of('')),
    )()

    assertSpyCall(request, 0, { args: [{
        url: `${authUrl}/oauth2/token`,
        method: 'POST',
        headers: O.some({
          'Content-Type': 'application/x-www-form-urlencoded'
        }),
        queryParams: O.none,
        body: O.some(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
      }]
    });

    assertEquals(accessToken, "access token");
  });

  await test.step("Given client credentials it will an error result instead of an access token when there is an error",  async () => {
    const request = spy(() => TE.left(new RequestFailure()));
    const getToken = getTwitchAuthoriser(request)();

    const result = await pipe(
      getToken,
      TE.map(() => ''),
      TE.getOrElse(() => T.of("authorisation failed")),
    )()

    assertEquals(result, "authorisation failed");
  });

  function getTwitchAuthoriser(request: (params: RequestParams) => TE.TaskEither<RequestFailure, RequestSuccess> ) {
    return twitchRequestAuthoriser({
      request,
      authUrl,
      clientId,
      clientSecret,
    });
  }
})
