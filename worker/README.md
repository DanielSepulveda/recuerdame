# Tldraw Sync Worker

Cloudflare Worker for tldraw real-time collaboration sync backend.

## Architecture

- **Durable Objects**: One instance per room handles WebSocket connections & state sync
- **R2 Storage**: Persists room snapshots and user-uploaded assets (images/videos)
- **WebSocket**: Real-time bidirectional sync between clients

## Local Development

```bash
# From worker directory
npm run dev

# Or from project root
npm run dev:worker
```

Worker runs at `http://localhost:8787`

## Deployment

### Prerequisites

1. Cloudflare account with Workers & R2 enabled
2. Wrangler CLI authenticated: `npx wrangler login`

### First-Time Setup

1. Create R2 bucket:
```bash
npx wrangler r2 bucket create recuerdame-tldraw
```

2. Update `wrangler.toml` if needed:
   - Verify bucket name matches: `recuerdame-tldraw`
   - Update `ALLOWED_ORIGINS` with production domain

3. Deploy:
```bash
npm run deploy
```

### Update Environment Variables

After deployment, update `.env.local` and `.env.production`:

```
NEXT_PUBLIC_TLDRAW_SYNC_URL=https://recuerdame-tldraw-sync.your-subdomain.workers.dev
```

Then redeploy Next.js app to Vercel to pick up new env var.

## Endpoints

- `GET /health` - Health check
- `WS /connect/:roomId` - WebSocket connection for room sync
- `POST /uploads` - Upload asset (image/video)
- `GET /assets/:assetId` - Retrieve asset

## Configuration

### CORS

Update `ALLOWED_ORIGINS` in `wrangler.toml` to include:
- Local dev: `http://localhost:3000`
- Production: Your Vercel domain

### Security

Currently no authentication - anyone with room ID can access.

To add Clerk auth:
1. Get Clerk JWT from client
2. Verify in Worker before WebSocket upgrade
3. Extract user identity for room authorization

## Monitoring

View logs:
```bash
npx wrangler tail
```

View deployment info:
```bash
npx wrangler deployments list
```

## Troubleshooting

**CORS errors**: Verify `ALLOWED_ORIGINS` includes your frontend domain

**WebSocket fails**: Check Worker URL uses correct protocol (wss:// not ws:// in prod)

**Asset upload fails**: Verify R2 bucket exists and binding is correct

**Version mismatch**: Ensure tldraw versions match between frontend and worker (currently 4.1.2)
