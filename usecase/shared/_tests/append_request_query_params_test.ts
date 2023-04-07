import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import * as O from "https://esm.sh/v103/fp-ts@2.13.1/lib/Option";
import { RequestParams } from "../fetch_request.ts";
import { appendRequestQueryParams } from "../fp_utils.ts";

Deno.test("Append request query params", async (test) => {    
    await test.step("Give existing query params it will append the additional query params", () => {
        const requestParams: RequestParams = {
            url: "url",
            method: "GET",
            headers: O.some({
                'test-header': 'test-header-value',
            }),
            queryParams: O.some({
                'existing-param-1': 'existing-param-value-1',
                'existing-param-2': 'existing-param-value-2',
            }),
            body: O.some('test body') 
        }

        const newQueryParams = {
            'new-param-1': 'new-param-value-1',
            'new-param-2': 'new-param-value-2',
        }
        
        const updatedQueryParams = appendRequestQueryParams(newQueryParams)(requestParams);

        assertEquals(updatedQueryParams, {
            url: "url",
            method: "GET",
            headers: O.some({
                'test-header': 'test-header-value',
            }),
            queryParams: O.some({
                'existing-param-1': 'existing-param-value-1',
                'existing-param-2': 'existing-param-value-2',
                ...newQueryParams
            }),
            body: O.some('test body') 
        })
    })

    await test.step("Give no existing query params it will append the additional query params", () => {
        const requestParams: RequestParams = {
            url: "url",
            method: "GET",
            headers: O.some({
                'test-header': 'test-header-value',
            }),
            queryParams: O.none,
            body: O.some('test body') 
        }

        const newQueryParams = {
            'new-param-1': 'new-param-value-1',
            'new-param-2': 'new-param-value-2',
        }
        
        const updatedQueryParams = appendRequestQueryParams(newQueryParams)(requestParams);

        assertEquals(updatedQueryParams, {
            url: "url",
            method: "GET",
            headers: O.some({
                'test-header': 'test-header-value',
            }),
            queryParams: O.some({
                ...newQueryParams
            }),
            body: O.some('test body') 
        })
    })
})