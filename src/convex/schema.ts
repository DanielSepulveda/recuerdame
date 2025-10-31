import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Primary table storing altar metadata and configuration
  altars: defineTable({
    // Basic altar information
    title: v.string(),
    description: v.optional(v.string()),

    // Ownership and creation
    ownerId: v.string(), // Clerk user ID
    createdAt: v.number(), // Unix timestamp
    updatedAt: v.number(), // Unix timestamp

    // tldraw integration
    roomId: v.string(), // Unique room ID for tldraw sync

    // Metadata
    tags: v.optional(v.array(v.string())), // For categorization/search
    culturalElements: v.optional(v.array(v.string())), // Traditional elements included
  })
    .index("by_owner", ["ownerId"])
    .index("by_created_at", ["createdAt"]),

  // Manages collaboration permissions and access control
  collaborators: defineTable({
    altarId: v.id("altars"),
    userId: v.string(), // Clerk user ID

    // Permission levels
    role: v.union(v.literal("editor"), v.literal("viewer")),

    // Collaboration metadata
    invitedAt: v.number(), // Unix timestamp
    invitedBy: v.string(), // Clerk user ID of inviter
    joinedAt: v.optional(v.number()), // When they first accessed
    lastActiveAt: v.optional(v.number()), // Last interaction timestamp

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("removed"),
    ),
  })
    .index("by_altar", ["altarId"])
    .index("by_user", ["userId"])
    .index("by_altar_and_user", ["altarId", "userId"])
    .index("by_status", ["status"]),

  // Tracks public sharing instances with basic view metrics
  altar_shares: defineTable({
    altarId: v.id("altars"),
    shareSlug: v.string(), // Unique slug for public access

    // Sharing configuration
    shareType: v.union(v.literal("public_view"), v.literal("public_edit")),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration

    // Analytics
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),

    // QR Code data
    qrCodeGenerated: v.boolean(),
    qrCodeData: v.optional(v.string()), // Base64 encoded QR code or URL to stored image
  })
    .index("by_altar", ["altarId"])
    .index("by_slug", ["shareSlug"])
    .index("by_created_at", ["createdAt"]),
});
