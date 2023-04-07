import { Router } from "https://deno.land/x/oak@v12.1.0/router.ts";

export const router = new Router();

router
  .get("/loaderio-9a4c1ac96731e6f3575ef4cc9c120916", (context) => {
    context.response.body = 'loaderio-9a4c1ac96731e6f3575ef4cc9c120916';
    context.response.status = 200;
  })