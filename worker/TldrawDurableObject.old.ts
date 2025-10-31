import { TLSocketRoom } from "@tldraw/sync-core";
import { TLRecord, createTLSchema } from "@tldraw/tlschema";
import throttle from "lodash.throttle";

export interface Env {
  TLDRAW_ROOMS: DurableObjectNamespace;
  TLDRAW_BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

// Custom schema supporting custom shapes/bindings (extend as needed)
const schema = createTLSchema();

export class TldrawDurableObject implements DurableObject {
  private room: TLSocketRoom<TLRecord> | null = null;
  private roomId: string;
  private snapshotPromise: Promise<any> | null = null;
  private throttledSave: (() => void) | null = null;

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {
    this.roomId = state.id.toString();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: this.getCorsHeaders(request),
      });
    }

    // WebSocket upgrade for sync connection
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: this.getCorsHeaders(request),
      });
    }

    return new Response("Expected WebSocket", {
      status: 400,
      headers: this.getCorsHeaders(request),
    });
  }

  private async handleWebSocket(ws: WebSocket) {
    try {
      // Lazy initialize room on first connection
      if (!this.room) {
        console.log(`[Room ${this.roomId}] Initializing room`);

        // Load snapshot once (lazy loading pattern)
        const initialSnapshot = await this.getSnapshot();

        // Create throttled save function (10s interval)
        this.throttledSave = throttle(() => {
          this.saveSnapshot().catch((err) =>
            console.error(`[Room ${this.roomId}] Save error:`, err),
          );
        }, 10000);

        this.room = new TLSocketRoom<TLRecord>({
          initialSnapshot,
          schema,

          // Throttled persistence on data change
          onDataChange: () => {
            if (this.throttledSave) {
              this.throttledSave();
            }
          },

          // Clean up when sessions removed
          onSessionRemoved: async (room, args) => {
            console.log(
              `[Room ${this.roomId}] Session removed. Remaining: ${args.numSessionsRemaining}`,
            );

            // Save final snapshot when last session disconnects
            if (args.numSessionsRemaining === 0) {
              console.log(`[Room ${this.roomId}] Last session left, saving final snapshot`);
              await this.saveSnapshot();
            }
          },
        });
      }

      // Connect WebSocket to room
      const sessionId = crypto.randomUUID();
      console.log(`[Room ${this.roomId}] New connection: ${sessionId}`);

      this.room.handleSocketConnect({
        socket: ws,
        sessionId,
      });
    } catch (error) {
      console.error(`[Room ${this.roomId}] WebSocket error:`, error);
      ws.close(1011, "Internal error");
    }
  }

  private async getSnapshot() {
    // Lazy loading: only load snapshot once
    if (!this.snapshotPromise) {
      this.snapshotPromise = this.loadSnapshot();
    }
    return this.snapshotPromise;
  }

  private async loadSnapshot() {
    try {
      const key = `room-${this.roomId}.json`;
      console.log(`[Room ${this.roomId}] Loading snapshot from R2: ${key}`);

      const object = await this.env.TLDRAW_BUCKET.get(key);

      if (!object) {
        console.log(`[Room ${this.roomId}] No existing snapshot, starting fresh`);
        return undefined;
      }

      const data = await object.text();
      const snapshot = JSON.parse(data);
      console.log(`[Room ${this.roomId}] Loaded snapshot successfully`);
      return snapshot;
    } catch (error) {
      console.error(`[Room ${this.roomId}] Failed to load snapshot:`, error);
      return undefined;
    }
  }

  private async saveSnapshot() {
    if (!this.room) return;

    try {
      const snapshot = this.room.getCurrentSnapshot();
      const key = `room-${this.roomId}.json`;

      console.log(`[Room ${this.roomId}] Saving snapshot to R2: ${key}`);

      await this.env.TLDRAW_BUCKET.put(key, JSON.stringify(snapshot), {
        httpMetadata: {
          contentType: "application/json",
        },
      });

      console.log(`[Room ${this.roomId}] Snapshot saved successfully`);
    } catch (error) {
      console.error(`[Room ${this.roomId}] Failed to save snapshot:`, error);
      throw error;
    }
  }

  private getCorsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = this.env.ALLOWED_ORIGINS.split(",");

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
}
