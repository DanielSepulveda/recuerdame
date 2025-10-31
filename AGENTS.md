# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 + Convex + Clerk full-stack app for building real-time applications with authentication and backend logic managed by Convex.

Stack:
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: Convex (database + server functions)
- **Auth**: Clerk
- **Language**: TypeScript 5

## Development Commands

```bash
# Install dependencies
npm install

# Start dev environment (runs both frontend and backend)
npm run dev

# Start only frontend dev server
npm run dev:frontend

# Start only Convex backend dev
npm run dev:backend

# Build for production
npm build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npx prettier --write .
```

## Convex Architecture

### Function Syntax (CRITICAL)

**Always use new function syntax** with explicit args/returns validators:

```typescript
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

If function returns nothing, use `returns: v.null()`.

### Function Types

- **Public**: `query`, `mutation`, `action` - exposed to public Internet
- **Internal**: `internalQuery`, `internalMutation`, `internalAction` - only callable by other Convex functions
- All imported from `./_generated/server`

### Function References & Calling

- Use `api` object for public functions: `api.myFunctions.listNumbers`
- Use `internal` object for internal functions: `internal.myFile.myInternalFunc`
- File-based routing: function `f` in `convex/example.ts` → `api.example.f`
- Functions in subdirectories: `convex/messages/access.ts` → `api.messages.access.funcName`

Call functions using:
- `ctx.runQuery(api.file.func, args)` - call query from query/mutation/action
- `ctx.runMutation(api.file.func, args)` - call mutation from mutation/action
- `ctx.runAction(api.file.func, args)` - call action from action

When calling same-file functions, add type annotation:
```typescript
const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
```

### Schema & Database

- Schema defined in `convex/schema.ts`
- System fields auto-added: `_id: v.id(tableName)`, `_creationTime: v.number()`
- Index naming: include all fields (e.g., `by_channelId_and_authorId`)
- Query with indexes using `withIndex` (avoid `filter` for performance)

```typescript
// Good
await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channelId", channelId))
  .take(10);

// Avoid
await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("channelId"), channelId))
  .take(10);
```

### Validators

Valid types:
- `v.id(tableName)`, `v.null()`, `v.int64()`, `v.number()`, `v.boolean()`, `v.string()`, `v.bytes()`
- `v.array(validator)`, `v.object({key: validator})`, `v.record(keyValidator, valueValidator)`
- `v.optional(validator)`, `v.union(validator1, validator2)`, `v.literal("value")`

### TypeScript Types

```typescript
import { Id, Doc } from "./_generated/dataModel";

// Use Id type for document IDs
type UserId = Id<"users">;

// Use Doc type for document shape
type User = Doc<"users">;

// Record with Id keys
const userMap: Record<Id<"users">, string> = {};
```

Always use `as const` for string literals in discriminated unions.

### Queries

- Default order: ascending `_creationTime`
- Use `.order("desc")` or `.order("asc")` to control ordering
- Use `.unique()` for single result (throws if multiple matches)
- No `.delete()` on queries - use `.collect()` then iterate with `ctx.db.delete(row._id)`
- For async iteration, use `for await (const row of query)` instead of `.collect()`

### Mutations

- `ctx.db.insert(table, data)` - create new document
- `ctx.db.patch(id, updates)` - shallow merge updates (throws if not exists)
- `ctx.db.replace(id, newDoc)` - full replacement (throws if not exists)
- `ctx.db.delete(id)` - remove document

### Actions

- Add `"use node";` at top of file if using Node.js built-ins
- Cannot use `ctx.db` - must call queries/mutations via `ctx.runQuery`/`ctx.runMutation`
- Use for third-party API calls, AI integrations, file processing
- Minimize calls to queries/mutations to avoid race conditions

### HTTP Endpoints

Defined in `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }),
});
export default http;
```

Endpoint registered at exact path specified.

### Pagination

```typescript
import { paginationOptsValidator } from "convex/server";

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

Returns: `{ page: Doc[], isDone: boolean, continueCursor: string }`

### Scheduling

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("task name", { hours: 2 }, internal.file.func, {});
export default crons;
```

Use `crons.interval` or `crons.cron` (not deprecated helpers).

### File Storage

- Store files via `ctx.storage.store(blob)`
- Get URL via `ctx.storage.getUrl(storageId)` (returns `null` if not exists)
- Query metadata from `_storage` system table:

```typescript
const metadata = await ctx.db.system.get(storageId);
// Returns: { _id, _creationTime, contentType?, sha256, size }
```

## Authentication (Clerk)

- Protected routes defined in `middleware.ts` using `createRouteMatcher`
- Clerk provider wraps app in `app/layout.tsx`
- Get user identity in Convex: `await ctx.auth.getUserIdentity()`
- Convex auth config in `convex/auth.config.ts` (currently disabled - uncomment to enable)

## Project Structure

```
app/               # Next.js App Router pages
  layout.tsx       # Root layout with Clerk + Convex providers
  page.tsx         # Home page
  server/          # Protected route example
components/        # React components
  ConvexClientProvider.tsx  # Convex + Clerk integration
convex/            # Convex backend
  _generated/      # Auto-generated types (don't edit)
  schema.ts        # Database schema
  auth.config.ts   # Auth configuration
  myFunctions.ts   # Example Convex functions
middleware.ts      # Clerk auth middleware
```

## Key Rules from .cursor/rules/convex_rules.mdc

1. **Always** include `args` and `returns` validators for all Convex functions
2. **Never** use deprecated `filter()` - use `withIndex()` instead
3. **Never** register functions through `api`/`internal` objects - export directly
4. **Never** use `v.bigint()` - use `v.int64()` instead
5. Be strict with types - use `Id<"tableName">` not `string` for document IDs
6. Include all index fields in index names (e.g., `by_field1_and_field2`)
7. Use internal functions (`internalQuery`, etc.) for sensitive operations
