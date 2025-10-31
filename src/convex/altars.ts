import { createId } from "@paralleldrive/cuid2";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const customId = createId();
    const name = args.name || `Altar ${new Date().toLocaleDateString("es-MX")}`;

    await ctx.db.insert("altars", {
      customId,
      name,
      createdBy: identity.subject,
      createdAt: Date.now(),
      isPublic: false,
    });

    return customId;
  },
});

export const get = query({
  args: {
    customId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("altars"),
      _creationTime: v.number(),
      customId: v.string(),
      name: v.string(),
      createdBy: v.string(),
      createdAt: v.number(),
      isPublic: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const altar = await ctx.db
      .query("altars")
      .withIndex("by_customId", (q) => q.eq("customId", args.customId))
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
      customId: v.string(),
      name: v.string(),
      createdBy: v.string(),
      createdAt: v.number(),
      isPublic: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const altars = await ctx.db
      .query("altars")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", identity.subject))
      .order("desc")
      .collect();

    return altars;
  },
});
