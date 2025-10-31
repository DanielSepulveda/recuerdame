import { handleUnfurlRequest } from "cloudflare-workers-unfurl";
import { AutoRouter, cors, error, type IRequest } from "itty-router";
import { handleAssetDownload, handleAssetUpload } from "./assetUploads";

// make sure our sync durable object is made available to cloudflare
export { TldrawDurableObject } from "./TldrawDurableObject";

interface Env {
  TLDRAW_ROOMS: DurableObjectNamespace;
  TLDRAW_BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

// CORS configuration for cross-origin requests
const { preflight, corsify } = cors({
  origin: "*", // Will be validated per-request
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "Upgrade",
    "Connection",
    "Sec-WebSocket-Key",
    "Sec-WebSocket-Version",
    "Sec-WebSocket-Extensions",
  ],
});

// Middleware to validate origin against allowed list
const validateOrigin = (request: IRequest, env: Env) => {
  const origin = request.headers.get("Origin");

  // No origin header means same-origin or non-browser request - allow it
  if (!origin) return;

  const allowedOrigins =
    env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

  if (!allowedOrigins.includes(origin)) {
    return error(403, `Origin ${origin} not allowed`);
  }
};

// we use itty-router (https://itty.dev/) to handle routing with CORS for cross-origin requests
const router = AutoRouter<IRequest, [env: Env, ctx: ExecutionContext]>({
  before: [preflight, validateOrigin],
  finally: [corsify],
  catch: (e) => {
    console.error(e);
    return error(e);
  },
})
  // requests to /connect are routed to the Durable Object, and handle realtime websocket syncing
  .get("/api/connect/:roomId", (request, env) => {
    const id = env.TLDRAW_ROOMS.idFromName(request.params.roomId);
    const room = env.TLDRAW_ROOMS.get(id);

    // Create a new Request to properly preserve WebSocket upgrade headers
    const durableObjectRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
    });

    return room.fetch(durableObjectRequest);
  })

  // assets can be uploaded to the bucket under /uploads:
  .post("/api/uploads/:uploadId", handleAssetUpload)

  // they can be retrieved from the bucket too:
  .get("/api/uploads/:uploadId", handleAssetDownload)

  // bookmarks need to extract metadata from pasted URLs:
  .get("/api/unfurl", handleUnfurlRequest)
  .all("*", () => {
    return new Response("Not found", { status: 404 });
  });

export default {
  fetch: router.fetch,
};
