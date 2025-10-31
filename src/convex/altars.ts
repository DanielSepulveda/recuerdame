import { createId } from "@paralleldrive/cuid2";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    culturalElements: v.optional(v.array(v.string())),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Validate authentication (Requirement 4.4)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate title length if provided
    if (args.title && args.title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    if (args.title && args.title.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }

    // Validate description length if provided
    if (args.description && args.description.length > 1000) {
      throw new Error("Description cannot exceed 1000 characters");
    }

    // Generate unique tldraw room ID (Requirements 1.1, 4.1)
    const roomId = createId();
    const title =
      args.title?.trim() || `Altar ${new Date().toLocaleDateString("es-MX")}`;
    const now = Date.now();

    // Create altar with all metadata (Requirement 1.1)
    await ctx.db.insert("altars", {
      title,
      description: args.description,
      ownerId: identity.subject,
      createdAt: now,
      updatedAt: now,
      roomId,
      tags: args.tags,
      culturalElements: args.culturalElements,
    });

    // Return room ID for tldraw integration (Requirement 4.4)
    return roomId;
  },
});

export const get = query({
  args: {
    roomId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("altars"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      ownerId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      roomId: v.string(),
      tags: v.optional(v.array(v.string())),
      culturalElements: v.optional(v.array(v.string())),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const altar = await ctx.db
      .query("altars")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .unique();

    return altar ?? null;
  },
});

export const listMy = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("altars"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      ownerId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      roomId: v.string(),
      tags: v.optional(v.array(v.string())),
      culturalElements: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const altars = await ctx.db
      .query("altars")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();

    return altars;
  },
});
