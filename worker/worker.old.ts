import { AutoRouter, error, type IRequest } from "itty-router";
import { handleAssetGet, handleAssetUpload } from "./assetUploads";
import { handleUnfurl } from "./bookmarkUnfurling";
import { type Env, TldrawDurableObject } from "./TldrawDurableObject.old";

export { TldrawDurableObject };

// Create router with AutoRouter for better error handling
const router = AutoRouter<IRequest, [env: Env, ctx: ExecutionContext]>({
  catch: (e) => {
    console.error("Router error:", e);
    return error(e);
  },
});

// Health check endpoint
router.get("/health", () => {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});

// WebSocket connection for sync
router.get("/api/connect/:roomId", async (request, env: Env) => {
  const { roomId } = request.params as { roomId: string };

  if (!roomId) {
    return new Response("Room ID required", {
      status: 400,
      headers: getCorsHeaders(request, env),
    });
  }

  // Get or create Durable Object for this room
  const id = env.TLDRAW_ROOMS.idFromName(roomId);
  const stub = env.TLDRAW_ROOMS.get(id);

  // Forward request to Durable Object
  return stub.fetch(request);
});

// Asset upload endpoint
router.post("/api/uploads/:assetId", async (request, env: Env) => {
  const { assetId } = request.params as { assetId: string };
  return handleAssetUpload(request, env, assetId);
});

// Asset retrieval endpoint
router.get(
  "/api/assets/:assetId",
  async (request, env: Env, ctx: ExecutionContext) => {
    const { assetId } = request.params as { assetId: string };
    return handleAssetGet(request, env, ctx, assetId);
  }
);

// Bookmark unfurling endpoint
router.get("/api/unfurl", async (request, env: Env) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "URL parameter required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(request, env),
      },
    });
  }

  try {
    const preview = await handleUnfurl(targetUrl);
    return new Response(JSON.stringify(preview), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(request, env),
      },
    });
  } catch (error) {
    console.error("Unfurl error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch preview" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(request, env),
      },
    });
  }
});

// 404 handler
router.all("*", () => {
  return new Response("Not Found", { status: 404 });
});

export default {
  fetch: router.fetch,
};

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = env.ALLOWED_ORIGINS.split(",");

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
