import { TldrawDurableObject, Env } from './TldrawDurableObject';
import { handleAssetUpload, handleAssetGet } from './assetUploads';

export { TldrawDurableObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: getCorsHeaders(request, env),
      });
    }

    // Route: /connect/:roomId - WebSocket connection for sync
    if (path.startsWith('/connect/')) {
      const roomId = path.slice('/connect/'.length);

      if (!roomId) {
        return new Response('Room ID required', {
          status: 400,
          headers: getCorsHeaders(request, env),
        });
      }

      // Get or create Durable Object for this room
      const id = env.TLDRAW_ROOMS.idFromName(roomId);
      const stub = env.TLDRAW_ROOMS.get(id);

      // Forward request to Durable Object
      return stub.fetch(request);
    }

    // Route: /uploads - Asset upload endpoint
    if (path === '/uploads' && request.method === 'POST') {
      return handleAssetUpload(request, env);
    }

    // Route: /assets/:assetId - Asset retrieval
    if (path.startsWith('/assets/')) {
      const assetId = path.slice('/assets/'.length);
      return handleAssetGet(assetId, env);
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response('OK', {
        headers: getCorsHeaders(request, env),
      });
    }

    // Default 404
    return new Response('Not Found', {
      status: 404,
      headers: getCorsHeaders(request, env),
    });
  },
};

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
