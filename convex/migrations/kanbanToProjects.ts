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
 * Add projectBoards to existing projects that don't have them
 *
 * This is needed for projects created before the 3-board system was implemented.
 * Creates Feature Requests, Bug Reports, and Internal Roadmap boards for each project.
 */
export const addProjectBoards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      projectsProcessed: 0,
      boardsCreated: 0,
      columnsCreated: 0,
      columnsLinked: 0,
      itemsLinked: 0,
      errors: [] as string[],
    };

    const BOARD_TYPES = [
      { type: "feature-requests" as const, name: "Feature Requests", order: 0 },
      { type: "bug-reports" as const, name: "Bug Reports", order: 1 },
      { type: "internal-roadmap" as const, name: "Internal Roadmap", order: 2 },
    ];

    const DEFAULT_COLUMNS = [
      { name: "Backlog", slug: "backlog", order: 0, canAddItems: true },
      { name: "In Progress", slug: "in-progress", order: 1, canAddItems: false },
      { name: "Review", slug: "review", order: 2, canAddItems: false },
      { name: "Done", slug: "done", order: 3, canAddItems: false },
    ];

    try {
      // Get all projects
      const projects = await ctx.db.query("projects").collect();
      console.log(`Found ${projects.length} projects`);

      for (const project of projects) {
        // Check if project already has boards
        const existingBoards = await ctx.db
          .query("projectBoards")
          .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
          .collect();

        if (existingBoards.length > 0) {
          console.log(`Project "${project.name}" already has ${existingBoards.length} boards, skipping`);
          continue;
        }

        console.log(`Processing project "${project.name}"...`);
        results.projectsProcessed++;

        // Get enabled boards from project (or default to all)
        // @ts-ignore - enabledBoards might not exist on old projects
        const enabledBoards = project.enabledBoards || ["feature-requests", "bug-reports", "internal-roadmap"];

        const now = Date.now();

        // Get existing columns for this project (legacy columns without boardId)
        const existingColumns = await ctx.db
          .query("projectColumns")
          .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
          .collect();

        // Get existing items for this project (legacy items without boardId)
        const existingItems = await ctx.db
          .query("projectItems")
          .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
          .collect();

        // Create the first board (Feature Requests) and link existing data to it
        const firstBoardDef = BOARD_TYPES[0];
        const firstBoardId = await ctx.db.insert("projectBoards", {
          projectId: project._id,
          boardType: firstBoardDef.type,
          name: firstBoardDef.name,
          isVisible: enabledBoards.includes(firstBoardDef.type),
          order: firstBoardDef.order,
          createdAt: now,
        });
        results.boardsCreated++;
        console.log(`  Created board: ${firstBoardDef.name}`);

        // Link existing columns to the first board (or create new ones if none exist)
        if (existingColumns.length > 0) {
          for (const column of existingColumns) {
            if (!column.boardId) {
              await ctx.db.patch(column._id, { boardId: firstBoardId });
              results.columnsLinked++;
            }
          }
          console.log(`  Linked ${results.columnsLinked} existing columns to ${firstBoardDef.name}`);
        } else {
          // Create default columns for first board
          for (const column of DEFAULT_COLUMNS) {
            await ctx.db.insert("projectColumns", {
              projectId: project._id,
              boardId: firstBoardId,
              name: column.name,
              slug: column.slug,
              order: column.order,
              canAddItems: column.canAddItems,
              createdAt: now,
            });
            results.columnsCreated++;
          }
          console.log(`  Created ${DEFAULT_COLUMNS.length} columns for ${firstBoardDef.name}`);
        }

        // Link existing items to the first board
        for (const item of existingItems) {
          if (!item.boardId) {
            await ctx.db.patch(item._id, { boardId: firstBoardId });
            results.itemsLinked++;
          }
        }
        if (existingItems.length > 0) {
          console.log(`  Linked ${existingItems.length} existing items to ${firstBoardDef.name}`);
        }

        // Create remaining boards (Bug Reports and Internal Roadmap) with their own columns
        for (let i = 1; i < BOARD_TYPES.length; i++) {
          const boardDef = BOARD_TYPES[i];

          const boardId = await ctx.db.insert("projectBoards", {
            projectId: project._id,
            boardType: boardDef.type,
            name: boardDef.name,
            isVisible: enabledBoards.includes(boardDef.type),
            order: boardDef.order,
            createdAt: now,
          });
          results.boardsCreated++;
          console.log(`  Created board: ${boardDef.name}`);

          // Create columns for this board
          for (const column of DEFAULT_COLUMNS) {
            await ctx.db.insert("projectColumns", {
              projectId: project._id,
              boardId: boardId,
              name: column.name,
              slug: column.slug,
              order: column.order,
              canAddItems: column.canAddItems,
              createdAt: now,
            });
            results.columnsCreated++;
          }
        }

        // Update project with enabledBoards if it doesn't have it
        // @ts-ignore
        if (!project.enabledBoards) {
          await ctx.db.patch(project._id, {
            enabledBoards: ["feature-requests", "bug-reports", "internal-roadmap"],
          });
        }
      }

      console.log("\n=== Migration Complete ===");
      console.log(`Projects processed: ${results.projectsProcessed}`);
      console.log(`Boards created: ${results.boardsCreated}`);
      console.log(`Columns created: ${results.columnsCreated}`);
      console.log(`Columns linked: ${results.columnsLinked}`);
      console.log(`Items linked: ${results.itemsLinked}`);

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
