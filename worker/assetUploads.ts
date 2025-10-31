import { Env } from "./TldrawDurableObject";

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

export async function handleAssetUpload(
  request: Request,
  env: Env,
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
        },
      );
    }

    // Validate file size
    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      console.warn(
        `File too large attempted: ${contentLength} bytes (max: ${MAX_FILE_SIZE})`,
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
        },
      );
    }

    // Generate unique asset ID
    const assetId = crypto.randomUUID();
    const key = `assets/${assetId}`;

    console.log(`[Asset Upload] Uploading ${contentType} to ${key}`);

    // Stream upload to R2
    await env.TLDRAW_BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType,
      },
    });

    // Return asset URL
    const assetUrl = `/assets/${assetId}`;

    console.log(`[Asset Upload] Successfully uploaded: ${assetUrl}`);

    return new Response(
      JSON.stringify({
        assetId,
        url: assetUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request, env),
        },
      },
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
      },
    );
  }
}

export async function handleAssetGet(
  assetId: string,
  env: Env,
): Promise<Response> {
  try {
    if (!assetId) {
      return new Response(
        JSON.stringify({ error: "Asset ID required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const key = `assets/${assetId}`;
    console.log(`[Asset Get] Fetching asset: ${key}`);

    const object = await env.TLDRAW_BUCKET.get(key);

    if (!object) {
      console.warn(`[Asset Get] Asset not found: ${key}`);
      return new Response(
        JSON.stringify({ error: "Asset not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[Asset Get] Successfully retrieved: ${key}`);

    // Return asset with appropriate headers for caching
    return new Response(object.body, {
      headers: {
        "Content-Type":
          object.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: object.etag,
      },
    });
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
      },
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
