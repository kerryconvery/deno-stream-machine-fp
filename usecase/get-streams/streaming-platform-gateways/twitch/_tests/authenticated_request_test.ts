import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { assertSpyCall, assertSpyCalls, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as OP from "/usecase/shared/fp/optional_param.ts";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { twitchAuthenticatedRequest } from "../authenticated_request.ts";
import { TwitchAuthenticationFailed, TwitchAuthorisationToken } from "../request_authoriser.ts";
import { RequestResponse, RequestSuccess, UnsupportedError, UnauthorizedRequest, RequestParams } from "../../../../shared/fetch_request.ts";

Deno.test("Twitch authenticated request", async (test) => {
  const clientId = "client_id";
  const authorisationToken = new TwitchAuthorisationToken("access_token", 0, "scope");
  const requestResult = new RequestSuccess("request result");
  const requestParams: RequestParams = {
    url: "url",
    method: "GET",
    headers: OP.none,
    queryParams: OP.none,
    body: OP.none 
  }

  await test.step("Given a request it will first obtain an access token", async () => {
    const request = spy(() => TE.right(requestResult));
    
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    await authenticatedRequest(requestParams)();
  
    assertSpyCalls(getAccessToken, 1);
  })

  await test.step("Given an expired access token it will get a new access token and retry the request", async () => {
    const renewedAuthorisationToken = new TwitchAuthorisationToken("renewed_access_token", 0, "scope");
  
    let retryCount = 0;
    const request = spy(() => {
      if (retryCount === 0) {
        retryCount++;
        return TE.left(new UnauthorizedRequest())
      }
      return TE.right(requestResult)
    });

    const getAccessToken = spy(() => {
      if (retryCount === 0) {
        return TE.right(authorisationToken)
      }
      return TE.right(renewedAuthorisationToken)
    });

    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest(requestParams),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
    
    assertSpyCalls(request, 2);
    assertSpyCall(request, 0, { args: [
      {
        url: "url",
        method: "GET",
        headers: OP.some({
          'Client-Id': clientId,
          'Authorization': `Bearer ${authorisationToken.getAccessToken()}`,
        }),
        queryParams: OP.none,
        body: OP.none,
      }
    ]});

    assertSpyCall(request, 1, { args: [
      {
        url: "url",
        method: "GET",
        headers: OP.some({
          'Client-Id': clientId,
          'Authorization': `Bearer ${renewedAuthorisationToken.getAccessToken()}`,
        }),
        queryParams: OP.none,
        body: OP.none,
      }
    ]});

    assertEquals(result, requestResult)
  });

  await test.step("Given a request it will return the result of the request", async () => {
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest(requestParams),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertEquals(result, requestResult)
  });

  await test.step("Given a request it will return an error if an access token could not be obtained", async () => {
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.left<TwitchAuthenticationFailed, TwitchAuthorisationToken>(new TwitchAuthenticationFailed()))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
      authenticatedRequest(requestParams),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertSpyCalls(getAccessToken, 1);
    assertInstanceOf(result, TwitchAuthenticationFailed);
  });

  await test.step("Given a request it will return an error if the request fails", async () => {
    const request = spy(() => TE.left(new UnsupportedError()));
    const getAccessToken = spy(() => TE.right(authorisationToken))
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    const result = await pipe(
     authenticatedRequest(requestParams),
      TE.getOrElse((error: RequestResponse) => T.of(error)),
    )();
  
    assertInstanceOf(result, UnsupportedError);
  });

  await test.step("Given an access token, it will reuse the token for future requests", async () => {
    const expectedRequest = {
      url: "url",
      method: "GET",
      headers: OP.some({
        'Client-Id': clientId,
        'Authorization': `Bearer ${authorisationToken.getAccessToken()}`,
      }),
      queryParams: OP.none,
      body: OP.none,
    }
    const request = spy(() => TE.right(requestResult));
    const getAccessToken = spy(() => TE.right(authorisationToken));
    const authenticatedRequest = twitchAuthenticatedRequest({ clientId, request, getAccessToken });
    
    await authenticatedRequest(requestParams)();

    await pipe(
      authenticatedRequest({ url: "url", method: "GET", headers: OP.none, queryParams: OP.none, body: OP.none }),
    )();
    
    assertSpyCalls(getAccessToken, 1);

    assertSpyCall(request, 0, { args: [expectedRequest]});
    assertSpyCall(request, 1, { args: [expectedRequest]});
  });
});