import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import { assertSpyCall, spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as T from "https://esm.sh/fp-ts@2.13.1/Task";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { pipe } from "https://esm.sh/fp-ts@2.13.1/function"
import { fetchRequest, RequestFailure, RequestParams, RequestSuccess, ResourceNotFound, UnauthorizedRequest, UnsupportedError } from "../fetch_request.ts";

Deno.test("Rest client", async (test) => {
  const requestParams: RequestParams = {
    url: "url",
    method: "GET",
    headers: O.none,
    body: O.none,
  }

  await test.step("Given a request it will invoke the request with the provided parameters", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve("result"),
    } as Response));

    const requestTask = pipe(
      fetchRequest(fetch)(requestParams),
      TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
    )()

    const result = await requestTask;

    assertInstanceOf(result, RequestSuccess);


    assertSpyCall(fetch, 0, { args: ["url", { method: "GET" }] });
  })

  await test.step("Given a request with headers it will include headers in the request", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve("result"),
    } as Response));

    await fetchRequest(fetch)({...requestParams, headers: O.some({ "header-key": "header-value" })})();
    
    assertSpyCall(fetch, 0, { args: ["url", { method: "GET", headers: { 'header-key': 'header-value'} }] });
  })

  await test.step("Given a request body it will include the body in the request", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve("result"),
    } as Response));

    await fetchRequest(fetch)({...requestParams, headers: O.none, body: O.some("request body") })();
    
    assertSpyCall(fetch, 0, { args: ["url", { method: "GET", body: "request body" }] });
  })

  await test.step("Given a request it will return a success result", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve("result"),
    } as Response));

    const requestTask = pipe(
      fetchRequest(fetch)(requestParams),
      TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
    )

    const result = await requestTask();

    assertInstanceOf(result, RequestSuccess)
    assertEquals(result.getData(), "result");
  })

  await test.step("Given a request that rejects it will return the error result", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.reject(new Error('error result')),
    } as Response));

    const requestTask = pipe(
      fetchRequest(fetch)(requestParams),
      TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
    )

    const result = await requestTask();

    assertInstanceOf(result, UnsupportedError);
  });

  await test.step("Given an unauthorized request it will return an unauthorized result", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve('unauthorized'),
      status: 401,
    } as Response));

    const requestTask = pipe(
      fetchRequest(fetch)(requestParams),
      TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
    )

    const result = await requestTask();

    assertInstanceOf(result, UnauthorizedRequest)
  })

  await test.step("Given a request for an unknown resource it will return a resource not found result", async () => {
    const fetch = spy(() => Promise.resolve({
      json: () => Promise.resolve('unauthorized'),
      status: 404,
    } as Response));

    const requestTask = pipe(
      fetchRequest(fetch)(requestParams),
      TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
    )

    const result = await requestTask();

    assertInstanceOf(result, ResourceNotFound)
  })

  await test.step("Given a request that returns an unsupported error response an unknown error result", () => {
    [400, 499, 500, 599].forEach(async (statusCode) => {
      const fetch = spy(() => Promise.resolve({
        json: () => Promise.resolve('unauthorized'),
        status: statusCode,
      } as Response));
  
      const requestTask = pipe(
        fetchRequest(fetch)(requestParams),
        TE.getOrElseW<RequestFailure, RequestFailure>((error) => T.of(error)),
      )
  
      const result = await requestTask();
  
      assertInstanceOf(result, UnsupportedError)    
    })
  })
})