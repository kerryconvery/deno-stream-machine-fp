import { getStreamsHandler } from "./route-handlers/streams_handlers.ts";

console.log('getting streams');

const streams = await getStreamsHandler();

console.log(streams);