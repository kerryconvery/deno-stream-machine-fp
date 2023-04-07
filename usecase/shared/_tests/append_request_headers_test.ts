import { assertEquals } from "https://deno.land/std@0.172.0/testing/asserts.ts";
import * as O from "https://esm.sh/v103/fp-ts@2.13.1/lib/Option";
import { RequestParams } from "../fetch_request.ts";
import { appendRequestHeaders } from "../fp_utils.ts";

Deno.test("Append option headers", async (test) => {    
    await test.step("Give existing headers it will append the additional headers", () => {
        const requestParams: RequestParams = {
            url: "url",
            method: "GET",
            headers: O.some({
                'existing-header-1': 'existing-header-value-1',
                'existing-header-2': 'existing-header-value-2',
            }),
            queryParams: O.some({
                'test-param': 'test-value'
            }),
            body: O.some('test body') 
        }

        const newHeaders = {
            'new-header-1': 'new-header-value-1',
            'new-header-2': 'new-header-value-2',
        }
        
        const updatedHeaders = appendRequestHeaders(newHeaders)(requestParams);

        assertEquals(updatedHeaders, {
            url: "url",
            method: "GET",
            headers: O.some({
                'existing-header-1': 'existing-header-value-1',
                'existing-header-2': 'existing-header-value-2',
                ...newHeaders
            }),
            queryParams: O.some({
                'test-param': 'test-value'
            }),
            body: O.some('test body') 
        })
    })

    await test.step("Give no existing headers it will append the additional headers", () => {
        const requestParams: RequestParams = {
            url: "url",
            method: "GET",
            headers: O.none,
            queryParams: O.some({
                'test-param': 'test-value'
            }),
            body: O.some('test body') 
        }

        const newHeaders = {
            'new-header-1': 'new-header-value-1',
            'new-header-2': 'new-header-value-2',
        }
        
        const updatedHeaders = appendRequestHeaders(newHeaders)(requestParams);

        assertEquals(updatedHeaders, {
            url: "url",
            method: "GET",
            headers: O.some({
                ...newHeaders
            }),
            queryParams: O.some({
                'test-param': 'test-value'
            }),
            body: O.some('test body') 
        })
    })
})