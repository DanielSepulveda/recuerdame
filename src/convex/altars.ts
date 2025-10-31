import { createId } from "@paralleldrive/cuid2";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";

// Shared validator for altar return type
const altarValidator = v.object({
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
});

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
  returns: v.union(altarValidator, v.null()),
  handler: async (ctx, args) => {
    const altar = await ctx.db
      .query("altars")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .unique();

    return altar ?? null;
  },
});

export const listMy = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(altarValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    return await ctx.db
      .query("altars")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Query to fetch all altars user owns or collaborates on as editor
export const listMyAltarsAndCollaborations = query({
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
      // User's role for this altar
      userRole: v.union(v.literal("owner"), v.literal("editor")),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Fetch owned altars
    const ownedAltars = await ctx.db
      .query("altars")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();

    // Fetch active editor collaborations
    const collaborations = await ctx.db
      .query("collaborators")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("role"), "editor"),
        ),
      )
      .collect();

    // Fetch altars for collaborations
    const collaboratedAltars = await Promise.all(
      collaborations.map(async (collab) => {
        const altar = await ctx.db.get(collab.altarId);
        return altar;
      }),
    );

    // Combine and annotate with role
    const ownedWithRole = ownedAltars.map((altar) => ({
      ...altar,
      userRole: "owner" as const,
    }));

    const collaboratedWithRole = collaboratedAltars
      .filter((altar) => altar !== null)
      .map((altar) => ({
        ...altar!,
        userRole: "editor" as const,
      }));

    return [...ownedWithRole, ...collaboratedWithRole];
  },
});

// Query to fetch altar details by ID with permission checks (Requirement 1.3)
export const getById = query({
  args: {
    altarId: v.id("altars"),
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
      // Include permission info for the current user
      userRole: v.optional(
        v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
      ),
      isPubliclyShared: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get the altar
    const altar = await ctx.db.get(args.altarId);
    if (!altar) {
      return null;
    }

    // Check if altar is publicly shared
    const publicShare = await ctx.db
      .query("altar_shares")
      .withIndex("by_altar", (q) => q.eq("altarId", args.altarId))
      .filter((q) => {
        // Check if share is not expired
        return q.or(
          q.eq(q.field("expiresAt"), undefined),
          q.gt(q.field("expiresAt"), Date.now()),
        );
      })
      .first();

    const isPubliclyShared = !!publicShare;

    // Get user identity for permission checks
    const identity = await ctx.auth.getUserIdentity();

    // If not authenticated, only allow access to publicly shared altars
    if (!identity) {
      if (isPubliclyShared) {
        return {
          ...altar,
          userRole: undefined,
          isPubliclyShared: true,
        };
      }
      throw new Error("Not authenticated");
    }

    // Check user permissions
    let userRole: "owner" | "editor" | "viewer" | undefined;

    // Check if user is the owner
    if (altar.ownerId === identity.subject) {
      userRole = "owner";
    } else {
      // Check if user is a collaborator
      const collaboration = await ctx.db
        .query("collaborators")
        .withIndex("by_altar_and_user", (q) =>
          q.eq("altarId", args.altarId).eq("userId", identity.subject),
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .unique();

      if (collaboration) {
        userRole = collaboration.role;
      }
    }

    // If user has no permissions and altar is not publicly shared, deny access
    if (!userRole && !isPubliclyShared) {
      throw new Error(
        "Access denied: You don't have permission to view this altar",
      );
    }

    return {
      ...altar,
      userRole,
      isPubliclyShared,
    };
  },
});
