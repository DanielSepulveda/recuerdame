import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration: Populate memberships table from existing altars and collaborators
 *
 * This migration:
 * 1. Creates owner membership records for all existing altars
 * 2. Migrates existing collaborator records to memberships table
 *
 * Run this ONCE after deploying the schema changes:
 * npx convex run migrations:migrateToMemberships
 */
export const migrateToMemberships = internalMutation({
  args: {},
  returns: v.object({
    ownersCreated: v.number(),
    collaboratorsMigrated: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const errors: string[] = [];
    let ownersCreated = 0;
    let collaboratorsMigrated = 0;

    // Step 1: Create owner memberships for all existing altars
    const allAltars = await ctx.db.query("altars").collect();

    for (const altar of allAltars) {
      try {
        // Check if owner membership already exists
        const existingMembership = await ctx.db
          .query("memberships")
          .withIndex("by_altar_and_user", (q) =>
            q.eq("altarId", altar._id).eq("userId", altar.ownerId)
          )
          .unique();

        if (!existingMembership) {
          await ctx.db.insert("memberships", {
            altarId: altar._id,
            userId: altar.ownerId,
            role: "owner",
            createdAt: altar.createdAt,
            status: "active",
          });
          ownersCreated++;
        }
      } catch (error) {
        errors.push(
          `Failed to create owner membership for altar ${altar._id}: ${error}`
        );
      }
    }

    // Step 2: Migrate existing collaborator records to memberships
    // Note: The "collaborators" table was renamed to "memberships" in the schema
    // This migration is meant to run ONCE during the transition period
    // After the migration, the old "collaborators" table can be deleted
    // TypeScript errors here are expected as the table no longer exists in schema
    try {
      // @ts-expect-error - This table existed before the schema migration
      const allCollaborators = await ctx.db.query("collaborators").collect();

      for (const collaborator of allCollaborators) {
        try {
          // Cast to any since this is from the old schema
          const col = collaborator as any;

          // Check if membership already exists
          const existingMembership = await ctx.db
            .query("memberships")
            .withIndex("by_altar_and_user", (q) =>
              q.eq("altarId", col.altarId).eq("userId", col.userId)
            )
            .unique();

          if (!existingMembership) {
            await ctx.db.insert("memberships", {
              altarId: col.altarId,
              userId: col.userId,
              role: col.role,
              createdAt: col.invitedAt,
              invitedBy: col.invitedBy,
              joinedAt: col.joinedAt,
              lastActiveAt: col.lastActiveAt,
              status: col.status,
            });
            collaboratorsMigrated++;
          }
        } catch (error) {
          errors.push(
            `Failed to migrate collaborator ${(collaborator as any)._id}: ${error}`
          );
        }
      }
    } catch (error) {
      // Table might not exist, that's okay
      errors.push(`Collaborators table query failed: ${error}`);
    }

    return {
      ownersCreated,
      collaboratorsMigrated,
      errors,
    };
  },
});
