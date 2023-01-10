import { getStreamsHandler } from "./usecase/streams/get-streams/handler.ts";

console.log('getting streams');

const streams = await getStreamsHandler();

console.log(streams);