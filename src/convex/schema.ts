import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  altars: defineTable({
    customId: v.string(), // cuid2 for tldraw roomId
    name: v.string(),
    createdBy: v.string(), // Clerk user ID
    createdAt: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_customId", ["customId"]),
});
