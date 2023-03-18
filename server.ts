import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { router as streamsRouter } from "./routes/stream_routes.ts";

const app = new Application()
app.use(
    oakCors({
      origin: "https://stream-machine.deno.dev"
    }),
);
app.use(streamsRouter.routes())
app.use(streamsRouter.allowedMethods())

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ??
        "localhost"
    }:${port}`,
  );
})

app.listen({ port: 3000 });