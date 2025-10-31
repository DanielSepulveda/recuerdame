import type { Env } from "./TldrawDurableObject.old";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for assets
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

// Helper to sanitize asset ID and get R2 object name
function getAssetObjectName(assetId: string) {
  return `assets/${assetId.replace(/[^a-zA-Z0-9_-]+/g, "_")}`;
}

export async function handleAssetUpload(
  request: Request,
  env: Env,
  assetId: string
): Promise<Response> {
  try {
    const contentType = request.headers.get("Content-Type");

    // Validate content type
    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      console.warn(`Invalid content type attempted: ${contentType}`);
      return new Response(
        JSON.stringify({
          error: "Invalid content type",
          allowedTypes: ALLOWED_TYPES,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request, env),
          },
        }
      );
    }

    // Validate file size
    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      console.warn(
        `File too large attempted: ${contentLength} bytes (max: ${MAX_FILE_SIZE})`
      );
      return new Response(
        JSON.stringify({
          error: "File too large",
          maxSize: MAX_FILE_SIZE,
        }),
        {
          status: 413,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request, env),
          },
        }
      );
    }

    const objectName = getAssetObjectName(assetId);

    // Check if upload already exists (duplicate detection)
    if (await env.TLDRAW_BUCKET.head(objectName)) {
      console.warn(`[Asset Upload] Upload already exists: ${objectName}`);
      return new Response(
        JSON.stringify({
          error: "Upload already exists",
          assetId,
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request, env),
          },
        }
      );
    }

    console.log(`[Asset Upload] Uploading ${contentType} to ${objectName}`);

    // Stream upload to R2
    await env.TLDRAW_BUCKET.put(objectName, request.body, {
      httpMetadata: request.headers,
    });

    console.log(`[Asset Upload] Successfully uploaded: ${assetId}`);

    return new Response(
      JSON.stringify({
        ok: true,
        assetId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request, env),
        },
      }
    );
  } catch (error) {
    console.error("[Asset Upload] Upload failed:", error);
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request, env),
        },
      }
    );
  }
}

export async function handleAssetGet(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  assetId: string
): Promise<Response> {
  try {
    if (!assetId) {
      return new Response(JSON.stringify({ error: "Asset ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const objectName = getAssetObjectName(assetId);

    // Check Cache API first (automatically handles ranges etc.)
    const cacheKey = new Request(request.url, { headers: request.headers });
    const cachedResponse = await caches.default.match(cacheKey);
    if (cachedResponse) {
      console.log(`[Asset Get] Cache hit: ${objectName}`);
      return cachedResponse;
    }

    console.log(`[Asset Get] Fetching asset: ${objectName}`);

    // Fetch from R2 with range support
    const object = await env.TLDRAW_BUCKET.get(objectName, {
      range: request.headers,
      onlyIf: request.headers,
    });

    if (!object) {
      console.warn(`[Asset Get] Asset not found: ${objectName}`);
      return new Response(JSON.stringify({ error: "Asset not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build response headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);

    // Assets are immutable, cache forever
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("etag", object.httpEtag);

    // Set CORS headers (set here so cached responses don't need extra CORS headers)
    headers.set("access-control-allow-origin", "*");

    // Cloudflare doesn't set content-range automatically, so we do it manually
    let contentRange: string | undefined;
    if (object.range) {
      if ("suffix" in object.range) {
        const start = object.size - object.range.suffix;
        const end = object.size - 1;
        contentRange = `bytes ${start}-${end}/${object.size}`;
      } else {
        const start = object.range.offset ?? 0;
        const end = object.range.length
          ? start + object.range.length - 1
          : object.size - 1;
        if (start !== 0 || end !== object.size - 1) {
          contentRange = `bytes ${start}-${end}/${object.size}`;
        }
      }
    }

    if (contentRange) {
      headers.set("content-range", contentRange);
    }

    // Determine correct body/status for response
    const body = "body" in object && object.body ? object.body : null;
    const status = body ? (contentRange ? 206 : 200) : 304;

    console.log(
      `[Asset Get] Successfully retrieved: ${objectName} (status: ${status})`
    );

    // Only cache complete (200) responses
    if (status === 200) {
      const [cacheBody, responseBody] = body!.tee();
      ctx.waitUntil(
        caches.default.put(
          cacheKey,
          new Response(cacheBody, { headers, status })
        )
      );
      return new Response(responseBody, { headers, status });
    }

    return new Response(body, { headers, status });
  } catch (error) {
    console.error("[Asset Get] Retrieval failed:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve asset",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

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
