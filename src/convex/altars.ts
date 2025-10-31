import { createId } from "@paralleldrive/cuid2";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const roomId = createId();
    const title =
      args.title || `Altar ${new Date().toLocaleDateString("es-MX")}`;
    const now = Date.now();

    await ctx.db.insert("altars", {
      title,
      description: args.description,
      ownerId: identity.subject,
      createdAt: now,
      updatedAt: now,
      roomId,
    });

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
    v.null(),
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
    }),
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
