import { Router } from "itty-router";
import { handleAssetGet, handleAssetUpload } from "./assetUploads";
import { handleUnfurl } from "./bookmarkUnfurling";
import { Env, TldrawDurableObject } from "./TldrawDurableObject";

export { TldrawDurableObject };

// Create router
const router = Router();

// Health check endpoint
router.get("/health", () => {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});

// WebSocket connection for sync
router.get("/connect/:roomId", async (request, env: Env) => {
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
router.post("/uploads", async (request, env: Env) => {
  return handleAssetUpload(request, env);
});

// Asset retrieval endpoint
router.get("/assets/:assetId", async (request, env: Env) => {
  const { assetId } = request.params as { assetId: string };
  return handleAssetGet(assetId, env);
});

// Bookmark unfurling endpoint
router.get("/api/unfurl", async (request, env: Env) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: "URL parameter required" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request, env),
        },
      },
    );
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
    return new Response(
      JSON.stringify({ error: "Failed to fetch preview" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request, env),
        },
      },
    );
  }
});

// 404 handler
router.all("*", () => {
  return new Response("Not Found", { status: 404 });
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: getCorsHeaders(request, env),
      });
    }

    // Route request
    try {
      return await router.fetch(request, env);
    } catch (error) {
      console.error("Router error:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: getCorsHeaders(request, env),
      });
    }
  },
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
