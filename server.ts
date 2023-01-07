import { getStreamsHandler } from "./route-handlers/streams_handlers.ts";

const streams = await getStreamsHandler();

console.log(streams);