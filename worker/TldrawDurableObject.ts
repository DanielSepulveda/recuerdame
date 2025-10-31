import { TLSocketRoom } from '@tldraw/sync-core';
import { TLRecord } from '@tldraw/tlschema';

export interface Env {
  TLDRAW_ROOMS: DurableObjectNamespace;
  TLDRAW_BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

export class TldrawDurableObject implements DurableObject {
  private room: TLSocketRoom<TLRecord> | null = null;
  private roomId: string;

  constructor(
    private state: DurableObjectState,
    private env: Env
  ) {
    this.roomId = state.id.toString();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: this.getCorsHeaders(request),
      });
    }

    // WebSocket upgrade for sync connection
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: this.getCorsHeaders(request),
      });
    }

    return new Response('Expected WebSocket', {
      status: 400,
      headers: this.getCorsHeaders(request),
    });
  }

  private async handleWebSocket(ws: WebSocket) {
    // Lazy initialize room on first connection
    if (!this.room) {
      this.room = new TLSocketRoom<TLRecord>({
        // Load persisted state from R2
        initialSnapshot: await this.loadSnapshot(),

        // Persist changes to R2
        onDataChange: async () => {
          await this.saveSnapshot();
        },

        // Clean up when room is idle
        onSessionRemoved: async (room, { numSessionsRemaining }) => {
          // If no more sessions, save final snapshot
          if (numSessionsRemaining === 0) {
            await this.saveSnapshot();
          }
        },
      });
    }

    // Connect WebSocket to room
    this.room.handleSocketConnect({
      socket: ws,
      sessionId: crypto.randomUUID(),
    });
  }

  private async loadSnapshot() {
    try {
      const key = `room-${this.roomId}.json`;
      const object = await this.env.TLDRAW_BUCKET.get(key);

      if (!object) {
        return undefined;
      }

      const data = await object.text();
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load snapshot:', error);
      return undefined;
    }
  }

  private async saveSnapshot() {
    if (!this.room) return;

    try {
      const snapshot = this.room.getCurrentSnapshot();
      const key = `room-${this.roomId}.json`;

      await this.env.TLDRAW_BUCKET.put(
        key,
        JSON.stringify(snapshot),
        {
          httpMetadata: {
            contentType: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to save snapshot:', error);
    }
  }

  private getCorsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = this.env.ALLOWED_ORIGINS.split(',');

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
}
