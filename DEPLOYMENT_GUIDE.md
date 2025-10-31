# Deployment Guide: Tldraw Sync with Cloudflare

Guide for deploying the tldraw collaborative sync backend to Cloudflare Workers.

## Architecture Overview

```
┌─────────────────┐         WebSocket          ┌──────────────────────┐
│  Next.js App    │ ────────────────────────> │ Cloudflare Worker    │
│  (Vercel)       │                            │  - WebSocket Router  │
└─────────────────┘                            │  - Asset Uploads     │
                                               └──────────────────────┘
                                                         │
                              ┌──────────────────────┬─┴─────────────┐
                              │                      │               │
                              ▼                      ▼               ▼
                      ┌──────────────┐      ┌──────────────┐   ┌──────────┐
                      │ Durable      │      │ Durable      │   │    R2    │
                      │ Object       │      │ Object       │   │  Bucket  │
                      │ (Room A)     │      │ (Room B)     │   │  Assets  │
                      └──────────────┘      └──────────────┘   └──────────┘
```

## Prerequisites

1. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com
   - Workers plan (Free tier works, Paid plan for production scale)

2. **Wrangler CLI**
   - Already installed in project: `wrangler@^4.45.3`
   - Authenticate: `npx wrangler login`

3. **Vercel Account** (for Next.js frontend)
   - Already deployed or ready to deploy

## Step 1: Create R2 Bucket

R2 stores room snapshots and user-uploaded assets.

```bash
npx wrangler r2 bucket create recuerdame-tldraw
```

Verify bucket created:
```bash
npx wrangler r2 bucket list
```

## Step 2: Configure Allowed Origins

Edit `worker/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:3000,https://your-domain.vercel.app"
```

Replace `your-domain.vercel.app` with your actual Vercel domain.

## Step 3: Deploy Worker

From project root:
```bash
npm run build:worker
```

Or from worker directory:
```bash
cd worker
npm run deploy
```

Note the deployed URL, e.g., `https://recuerdame-tldraw-sync.your-subdomain.workers.dev`

## Step 4: Update Environment Variables

### Local Development

Update `.env.local`:
```bash
# For local worker testing
NEXT_PUBLIC_TLDRAW_SYNC_URL='http://localhost:8787'
```

### Production

Update `.env.production` or Vercel environment variables:
```bash
NEXT_PUBLIC_TLDRAW_SYNC_URL='https://recuerdame-tldraw-sync.your-subdomain.workers.dev'
```

Set in Vercel:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_TLDRAW_SYNC_URL` with production Worker URL
3. Select "Production" environment
4. Save

## Step 5: Redeploy Next.js App

After updating environment variables, redeploy Next.js:

```bash
# Trigger Vercel deployment
git add .
git commit -m "Update tldraw sync URL"
git push
```

Or manually in Vercel dashboard: Deployments → Redeploy

## Local Development Workflow

Run all services in parallel:

```bash
npm run dev
```

This starts:
- Next.js frontend: `http://localhost:3000`
- Convex backend: Convex cloud
- Tldraw Worker: `http://localhost:8787`

Or run individually:
```bash
npm run dev:frontend   # Next.js only
npm run dev:backend    # Convex only
npm run dev:worker     # Worker only
```

## Monitoring & Debugging

### View Worker Logs

Stream real-time logs:
```bash
npx wrangler tail
```

Or from worker directory:
```bash
cd worker && npm run tail
```

### Check Deployment Status

```bash
npx wrangler deployments list
```

### Test WebSocket Connection

Use browser console on your app:
```javascript
const ws = new WebSocket('ws://localhost:8787/connect/test-room-123');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

For production, replace with `wss://` URL.

### Common Issues

**CORS Errors**
- Verify `ALLOWED_ORIGINS` in `wrangler.toml` includes your domain
- Check Worker logs for CORS-related errors

**WebSocket Connection Fails**
- Ensure protocol is `ws://` for local, `wss://` for production
- Check Worker is deployed: `npx wrangler deployments list`
- Verify R2 bucket exists: `npx wrangler r2 bucket list`

**Asset Upload Fails**
- Check R2 bucket binding in `wrangler.toml`
- Verify CORS headers allow POST to `/uploads`
- Check file size limits (currently 10MB max)

**Version Mismatch Error**
- Ensure `tldraw` and `@tldraw/sync` versions match in both:
  - Root `package.json`: `^4.1.2`
  - Worker `package.json`: `^4.1.2`

## Production Checklist

Before going to production:

- [ ] Custom Worker domain configured (optional)
- [ ] CORS origins limited to production domains only
- [ ] R2 bucket exists and has proper access controls
- [ ] Environment variables set in Vercel
- [ ] Test multi-user collaboration
- [ ] Test asset upload/retrieval
- [ ] Monitor Worker logs for errors
- [ ] Set up alerts for Worker failures (Cloudflare dashboard)

## Custom Domain (Optional)

To use custom domain for Worker:

1. Add domain to Cloudflare
2. Go to Worker settings → Triggers → Custom Domains
3. Add `sync.your-domain.com`
4. Update `NEXT_PUBLIC_TLDRAW_SYNC_URL` to use custom domain

## Cost Estimates

### Cloudflare (Workers + R2)

**Free Tier:**
- 100,000 Worker requests/day
- 10GB R2 storage
- 10 million R2 Class A operations/month

**Paid Plan ($5/month):**
- 10 million Worker requests
- 50GB R2 storage
- Suitable for ~100-500 concurrent users

### Vercel

Frontend deployment - covered by existing Vercel plan.

## Rollback Procedure

If deployment fails:

1. List deployments:
```bash
npx wrangler deployments list
```

2. Rollback to previous version:
```bash
npx wrangler rollback --message "Reverting to stable version"
```

3. Redeploy Next.js with previous Worker URL if needed

## Security Considerations

### Current State (No Auth)
- Anyone with room ID can access
- Room ID acts as shared secret
- Suitable for private links, not public access

### Adding Authentication

To add Clerk JWT verification:

1. Get JWT from client:
```typescript
const { getToken } = useAuth();
const token = await getToken();
```

2. Pass in WebSocket connection:
```typescript
uri: `wss://worker.dev/connect/${roomId}?token=${token}`
```

3. Verify in Worker before upgrade:
```typescript
// In TldrawDurableObject.ts
const url = new URL(request.url);
const token = url.searchParams.get('token');
// Verify token with Clerk
```

## Support

- **tldraw docs**: https://tldraw.dev/docs/sync
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler

## Next Steps

After successful deployment:

1. Test collaboration with multiple users
2. Monitor Worker performance in Cloudflare dashboard
3. Set up alerting for Worker errors
4. Consider adding authentication
5. Implement rate limiting for uploads
6. Add room listing/management UI
