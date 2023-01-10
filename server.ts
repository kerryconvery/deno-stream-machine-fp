import { getStreamsHandler } from "./usecase/streams/get-streams/handler.ts";

console.log('getting streams');

await getStreamsHandler()
  .then((streams) => {
    console.log(streams);
  })