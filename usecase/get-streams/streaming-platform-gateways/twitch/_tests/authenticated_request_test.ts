import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { assertSpyCall, assertSpyCalls, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { twitchAuthenticatedRequest } from "../authenticated_request.ts";
import { TwitchAuthorisationFailed, TwitchAuthorisationToken } from "../request_authoriser.ts";
import { RequestResponse, RequestSuccess, UnsupportedError, UnauthorizedRequest } from "../../../../shared/fetch_request.ts";

Deno.test("Twitch authenticated request", async (test) => {
  const clientId = "client_id";
  const authorisationToken = new TwitchAuthorisationToken("access_token", 0, "scope");
  const requestResult = new RequestSuccess("request result");

  await test.step("Given a request it will first obtain an access token", async () => {
    const request = spy(() => TE.right(requestResult));
    
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    await authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none })();
  
    assertSpyCalls(getAccessToken, 1);
  })

  await test.step("Given an access token it will invoke the request with the access token", async () => {
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    await authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none })();
    
    assertSpyCall(request, 0, { args: [
      {
        url: "url",
        method: "GET",
        headers: O.some({
          'Client-Id': clientId,
          'Authorization': `Bearer ${authorisationToken.getAccessToken()}`,
        }),
        body: O.none,
      }
    ]});
  });

  await test.step("Given a request it will return the result of the request", async () => {
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none  }),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertEquals(result, requestResult)
  });

  await test.step("Given a request it will return an error if an access token could not be obtained", async () => {
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.left<TwitchAuthorisationFailed, TwitchAuthorisationToken>({ message: 'access token error' }))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none }),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertInstanceOf(result, UnauthorizedRequest);
  });

  await test.step("Given a request it will return an error if the request fails", async () => {
    const request = spy(() => TE.left(new UnsupportedError()));
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none }),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertInstanceOf(result, UnsupportedError);
  });

  await test.step("Given an access token, it will reuse the token for future requests", async () => {
    const expectedRequest = {
      url: "url",
      method: "GET",
      headers: O.some({
        'Client-Id': clientId,
        'Authorization': `Bearer ${authorisationToken.getAccessToken()}`,
      }),
      body: O.none,
    }
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.right(authorisationToken));
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none }),
    )();

    await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: O.none, body: O.none }),
    )();
    
    assertSpyCalls(getAccessToken, 1);

    assertSpyCall(request, 0, { args: [expectedRequest]});
    assertSpyCall(request, 1, { args: [expectedRequest]});
  });
});