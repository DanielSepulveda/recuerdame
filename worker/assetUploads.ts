import { Env } from './TldrawDurableObject';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for assets
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export async function handleAssetUpload(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const contentType = request.headers.get('Content-Type');

    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      return new Response('Invalid content type', {
        status: 400,
        headers: getCorsHeaders(request, env),
      });
    }

    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return new Response('File too large', {
        status: 413,
        headers: getCorsHeaders(request, env),
      });
    }

    // Generate unique asset ID
    const assetId = crypto.randomUUID();
    const key = `assets/${assetId}`;

    // Stream upload to R2
    await env.TLDRAW_BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType,
      },
    });

    // Return asset URL
    const assetUrl = `/assets/${assetId}`;

    return new Response(
      JSON.stringify({
        assetId,
        url: assetUrl,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env),
        },
      }
    );
  } catch (error) {
    console.error('Asset upload error:', error);
    return new Response('Upload failed', {
      status: 500,
      headers: getCorsHeaders(request, env),
    });
  }
}

export async function handleAssetGet(
  assetId: string,
  env: Env
): Promise<Response> {
  try {
    if (!assetId) {
      return new Response('Asset ID required', { status: 400 });
    }

    const key = `assets/${assetId}`;
    const object = await env.TLDRAW_BUCKET.get(key);

    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    // Return asset with appropriate headers for caching
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': object.etag,
      },
    });
  } catch (error) {
    console.error('Asset retrieval error:', error);
    return new Response('Failed to retrieve asset', { status: 500 });
  }
}

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',');

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}
