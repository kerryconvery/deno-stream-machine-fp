import { spy } from "https://deno.land/std@0.172.0/testing/mock.ts";
import { assertSpyCall } from "https://deno.land/std@0.172.0/testing/mock.ts";
import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts"
import * as TE from "https://esm.sh/fp-ts@2.13.1/TaskEither";
import * as O from "https://esm.sh/fp-ts@2.13.1/Option";
import { RequestFailure, RequestParams, RequestSuccess } from "../../../../shared/fetch_request.ts";
import { youtubeAuthorizedRequest } from "../youtube_v3_authorized_request.ts";

Deno.test("Youtube v3 authorized request", async (test) => {
    const requestResult = TE.right<RequestFailure, RequestSuccess>(new RequestSuccess("request result"));
    const request = spy(() => requestResult);
    const requestParams: RequestParams = {
        url: "url",
        method: "GET",
        headers: O.some({
            'test-header': 'test-value'
        }),
        queryParams: O.some({
            'test-param': 'test-value'
        }),
        body: O.some('test body') 
    }
    
    await test.step("Given a valid api key it will include the key in the request query params and return the result", async () => {
        const authorizedRequest = youtubeAuthorizedRequest({ apiKey: 'valid-api-key', request });
        
        const result = await authorizedRequest(requestParams);

        assertSpyCall(request, 0, { args: [
            {
                url: "url",
                method: "GET",
                headers: O.some({
                    'test-header': 'test-value'
                }),
                queryParams: O.some({
                    'test-param': 'test-value',
                    'key': 'valid-api-key',
                }),
                body: O.some('test body') 
            }
          ]}
        );

        assertEquals(result, requestResult);
    })
})