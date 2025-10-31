import { createId } from "@paralleldrive/cuid2";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
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
    })
  ),
  handler: async (ctx, _args) => {
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
          q.eq(q.field("role"), "editor")
        )
      )
      .collect();

    // Fetch altars for collaborations
    const collaboratedAltars = await Promise.all(
      collaborations.map(async (collab) => {
        const altar = await ctx.db.get(collab.altarId);
        return altar;
      })
    );

    // Combine and annotate with role
    const ownedWithRole = ownedAltars.map((altar) => ({
      ...altar,
      userRole: "owner" as const,
    }));

    const collaboratedWithRole = collaboratedAltars
      .filter((altar): altar is NonNullable<typeof altar> => altar !== null)
      .map((altar) => ({
        ...altar,
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
        v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer"))
      ),
      isPubliclyShared: v.boolean(),
    }),
    v.null()
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
          q.gt(q.field("expiresAt"), Date.now())
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
          q.eq("altarId", args.altarId).eq("userId", identity.subject)
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
        "Access denied: You don't have permission to view this altar"
      );
    }

    return {
      ...altar,
      userRole,
      isPubliclyShared,
    };
  },
});

// Mutation to update altar metadata (Requirements 1.4)
export const update = mutation({
  args: {
    altarId: v.id("altars"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    culturalElements: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the altar to verify ownership
    const altar = await ctx.db.get(args.altarId);
    if (!altar) {
      throw new Error("Altar not found");
    }

    // Check if user is the owner (only owners can update altar metadata)
    if (altar.ownerId !== identity.subject) {
      throw new Error(
        "Access denied: Only the altar owner can update metadata"
      );
    }

    // Validate inputs
    if (args.title !== undefined) {
      if (args.title.trim().length === 0) {
        throw new Error("Title cannot be empty");
      }
      if (args.title.length > 200) {
        throw new Error("Title cannot exceed 200 characters");
      }
    }

    if (args.description !== undefined && args.description.length > 1000) {
      throw new Error("Description cannot exceed 1000 characters");
    }

    // Build update object with only provided fields
    const updateData: Partial<{
      title: string;
      description: string | undefined;
      tags: string[] | undefined;
      culturalElements: string[] | undefined;
      updatedAt: number;
    }> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updateData.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updateData.description = args.description;
    }
    if (args.tags !== undefined) {
      updateData.tags = args.tags;
    }
    if (args.culturalElements !== undefined) {
      updateData.culturalElements = args.culturalElements;
    }

    // Update the altar
    await ctx.db.patch(args.altarId, updateData);
  },
});

// Mutation to delete altar with proper cleanup (Requirements 1.4, 1.5)
export const deleteAltar = mutation({
  args: {
    altarId: v.id("altars"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the altar to verify ownership
    const altar = await ctx.db.get(args.altarId);
    if (!altar) {
      throw new Error("Altar not found");
    }

    // Check if user is the owner (only owners can delete altars)
    if (altar.ownerId !== identity.subject) {
      throw new Error(
        "Access denied: Only the altar owner can delete the altar"
      );
    }

    // Check if altar has active collaborators (Requirement 1.5)
    const activeCollaborators = await ctx.db
      .query("collaborators")
      .withIndex("by_altar", (q) => q.eq("altarId", args.altarId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeCollaborators.length > 0) {
      throw new Error(
        "Cannot delete altar with active collaborators. Please remove all collaborators first."
      );
    }

    // Clean up related records before deleting the altar

    // 1. Delete all collaborator records (including pending and removed ones)
    const allCollaborators = await ctx.db
      .query("collaborators")
      .withIndex("by_altar", (q) => q.eq("altarId", args.altarId))
      .collect();

    for (const collaborator of allCollaborators) {
      await ctx.db.delete(collaborator._id);
    }

    // 2. Delete all share records
    const allShares = await ctx.db
      .query("altar_shares")
      .withIndex("by_altar", (q) => q.eq("altarId", args.altarId))
      .collect();

    for (const share of allShares) {
      await ctx.db.delete(share._id);
    }

    // 3. Finally delete the altar itself
    await ctx.db.delete(args.altarId);
  },
});
