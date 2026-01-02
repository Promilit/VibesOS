// @ts-nocheck
import { internalMutation } from "../_generated/server";

/**
 * Migration script: Kanban Boards → Projects
 *
 * This migration handles the transition from the old kanbanBoards structure
 * to the new projects structure with per-project customization.
 *
 * Changes:
 * 1. Adds commentCount: 0 to all existing projectItems
 * 2. Adds updatedAt: createdAt to all existing projects
 * 3. Creates projectCustomization records for each project (copying from widgetCustomization if exists)
 *
 * NOTE: Table renames are handled automatically by Convex schema evolution:
 * - kanbanBoards → projects
 * - kanbanColumns → projectColumns
 * - kanbanItems → projectItems
 * - kanbanVotes → projectVotes
 * - widgetCustomization → projectCustomization (structure change)
 */

export const migrateKanbanToProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      projectsUpdated: 0,
      itemsUpdated: 0,
      customizationsCreated: 0,
      errors: [] as string[],
    };

    try {
      // Step 1: Update all existing projects with updatedAt if missing
      console.log("Step 1: Updating projects with updatedAt...");
      const projects = await ctx.db.query("projects").collect();

      for (const project of projects) {
        // @ts-ignore - updatedAt might not exist yet
        if (!project.updatedAt) {
          await ctx.db.patch(project._id, {
            updatedAt: project.createdAt,
          });
          results.projectsUpdated++;
        }
      }
      console.log(`Updated ${results.projectsUpdated} projects with updatedAt`);

      // Step 2: Update all existing items with commentCount if missing
      console.log("Step 2: Updating items with commentCount...");
      const items = await ctx.db.query("projectItems").collect();

      for (const item of items) {
        // @ts-ignore - commentCount might not exist yet
        if (item.commentCount === undefined) {
          await ctx.db.patch(item._id, {
            commentCount: 0,
          });
          results.itemsUpdated++;
        }
      }
      console.log(`Updated ${results.itemsUpdated} items with commentCount`);

      // Step 3: Create projectCustomization for each project
      // If user had a global widgetCustomization, copy it to all their projects
      console.log("Step 3: Creating per-project customizations...");

      // Get all unique userIds from projects
      const userIds = [...new Set(projects.map(p => p.userId))];

      for (const userId of userIds) {
        // Get user's projects
        const userProjects = projects.filter(p => p.userId === userId);

        // Try to find old widgetCustomization for this user
        // Note: This might fail if the table doesn't exist anymore, which is fine
        let oldCustomization = null;
        try {
          // @ts-ignore - widgetCustomization table might not exist
          const widgetCustomizations = await ctx.db
            .query("widgetCustomization")
            .collect();

          // @ts-ignore - apiKeyUserId might not exist
          oldCustomization = widgetCustomizations.find(c => c.apiKeyUserId === userId);
        } catch (e) {
          console.log(`No widgetCustomization found for user ${userId}, using defaults`);
        }

        // Create customization for each project
        for (const project of userProjects) {
          // Check if customization already exists
          const existingCustomization = await ctx.db
            .query("projectCustomization")
            .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
            .first();

          if (!existingCustomization) {
            const now = Date.now();

            // Create customization with old data if available, otherwise empty
            await ctx.db.insert("projectCustomization", {
              projectId: project._id,
              logoUrl: oldCustomization?.logoUrl,
              companyName: oldCustomization?.companyName,
              widgetTitle: oldCustomization?.widgetTitle,
              primaryColor: oldCustomization?.primaryColor,
              secondaryColor: oldCustomization?.secondaryColor,
              backgroundColor: oldCustomization?.backgroundColor,
              cardBackgroundColor: oldCustomization?.cardBackgroundColor,
              textColor: oldCustomization?.textColor,
              borderColor: oldCustomization?.borderColor,
              darkPrimaryColor: oldCustomization?.darkPrimaryColor,
              darkSecondaryColor: oldCustomization?.darkSecondaryColor,
              darkBackgroundColor: oldCustomization?.darkBackgroundColor,
              darkCardBackgroundColor: oldCustomization?.darkCardBackgroundColor,
              darkTextColor: oldCustomization?.darkTextColor,
              darkBorderColor: oldCustomization?.darkBorderColor,
              fontFamily: oldCustomization?.fontFamily,
              fontSize: oldCustomization?.fontSize,
              headingFontFamily: oldCustomization?.headingFontFamily,
              borderRadius: oldCustomization?.borderRadius,
              spacing: oldCustomization?.spacing,
              customCss: oldCustomization?.customCss,
              createdAt: now,
              updatedAt: now,
            });
            results.customizationsCreated++;
          }
        }
      }
      console.log(`Created ${results.customizationsCreated} project customizations`);

      // Step 4: Summary
      console.log("\n=== Migration Complete ===");
      console.log(`Projects updated: ${results.projectsUpdated}`);
      console.log(`Items updated: ${results.itemsUpdated}`);
      console.log(`Customizations created: ${results.customizationsCreated}`);
      console.log(`Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log("\nErrors encountered:");
        results.errors.forEach(err => console.log(`- ${err}`));
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Migration failed:", errorMessage);
      results.errors.push(errorMessage);
      throw error;
    }
  },
});

/**
 * Rollback migration (if needed)
 *
 * WARNING: This will delete all projectCustomization records
 * Only use this if the migration needs to be re-run
 */
export const rollbackMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Rolling back migration...");

    // Delete all projectCustomization records
    const customizations = await ctx.db.query("projectCustomization").collect();
    let deleted = 0;

    for (const customization of customizations) {
      await ctx.db.delete(customization._id);
      deleted++;
    }

    console.log(`Deleted ${deleted} projectCustomization records`);
    console.log("NOTE: You'll need to manually remove commentCount and updatedAt fields if needed");

    return { deleted };
  },
});

/**
 * Verify migration status
 *
 * Checks if the migration has been completed successfully
 */
export const verifyMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const status = {
      totalProjects: 0,
      projectsWithUpdatedAt: 0,
      totalItems: 0,
      itemsWithCommentCount: 0,
      totalCustomizations: 0,
      projectsWithCustomization: 0,
      projectsMissingCustomization: [] as string[],
    };

    // Check projects
    const projects = await ctx.db.query("projects").collect();
    status.totalProjects = projects.length;

    for (const project of projects) {
      // @ts-ignore
      if (project.updatedAt !== undefined) {
        status.projectsWithUpdatedAt++;
      }

      // Check if project has customization
      const customization = await ctx.db
        .query("projectCustomization")
        .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
        .first();

      if (customization) {
        status.totalCustomizations++;
      } else {
        status.projectsMissingCustomization.push(project.name);
      }
    }

    status.projectsWithCustomization = status.totalCustomizations;

    // Check items
    const items = await ctx.db.query("projectItems").collect();
    status.totalItems = items.length;

    for (const item of items) {
      // @ts-ignore
      if (item.commentCount !== undefined) {
        status.itemsWithCommentCount++;
      }
    }

    console.log("\n=== Migration Status ===");
    console.log(`Projects: ${status.projectsWithUpdatedAt}/${status.totalProjects} have updatedAt`);
    console.log(`Items: ${status.itemsWithCommentCount}/${status.totalItems} have commentCount`);
    console.log(`Customizations: ${status.projectsWithCustomization}/${status.totalProjects} projects have customization`);

    if (status.projectsMissingCustomization.length > 0) {
      console.log("\nProjects missing customization:");
      status.projectsMissingCustomization.forEach(name => console.log(`- ${name}`));
    }

    const isComplete =
      status.projectsWithUpdatedAt === status.totalProjects &&
      status.itemsWithCommentCount === status.totalItems &&
      status.projectsWithCustomization === status.totalProjects;

    console.log(`\nMigration complete: ${isComplete ? 'YES ✓' : 'NO ✗'}`);

    return status;
  },
});
