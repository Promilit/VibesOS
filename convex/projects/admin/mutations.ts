// @ts-nocheck
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { verifyProjectOwnership } from "../lib/permissions";

/**
 * Generate a URL-safe slug from a project name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Board type definitions
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

/**
 * Create a new project with 3 boards and default columns
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublicViewOnly: v.boolean(),
    enabledBoards: v.optional(v.array(v.string())), // ["feature-requests", "bug-reports", "internal-roadmap"]
    apiKeyId: v.optional(v.id("apiKeys")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();
    const slug = generateSlug(args.name);

    // Default to all boards enabled
    const enabledBoards = args.enabledBoards || ["feature-requests", "bug-reports", "internal-roadmap"];

    // Validate API key if provided
    if (args.apiKeyId) {
      const apiKey = await ctx.db.get(args.apiKeyId);
      if (!apiKey || apiKey.userId !== userId) {
        throw new Error("Invalid API key");
      }
    }

    // Check if slug already exists for this user
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("byUserIdAndSlug", (q) =>
        q.eq("userId", userId).eq("slug", slug)
      )
      .first();

    if (existingProject) {
      throw new Error("A project with this name already exists");
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      userId,
      name: args.name,
      slug,
      description: args.description,
      isPublicViewOnly: args.isPublicViewOnly,
      apiKeyId: args.apiKeyId,
      enabledBoards,
      createdAt: now,
      updatedAt: now,
    });

    // Create 3 project boards
    for (const boardDef of BOARD_TYPES) {
      const isVisible = enabledBoards.includes(boardDef.type);

      const boardId = await ctx.db.insert("projectBoards", {
        projectId,
        boardType: boardDef.type,
        name: boardDef.name,
        isVisible,
        order: boardDef.order,
        createdAt: now,
      });

      // Create 4 columns for each board
      for (const column of DEFAULT_COLUMNS) {
        await ctx.db.insert("projectColumns", {
          projectId,
          boardId,
          name: column.name,
          slug: column.slug,
          order: column.order,
          canAddItems: column.canAddItems,
          createdAt: now,
        });
      }
    }

    return projectId;
  },
});

/**
 * Update which boards are visible/enabled for a project
 */
export const updateProjectBoards = mutation({
  args: {
    projectId: v.id("projects"),
    enabledBoards: v.array(v.string()), // ["feature-requests", "bug-reports", "internal-roadmap"]
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    // Update project
    await ctx.db.patch(args.projectId, {
      enabledBoards: args.enabledBoards,
      updatedAt: Date.now(),
    });

    // Update board visibility
    const boards = await ctx.db
      .query("projectBoards")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const board of boards) {
      const isVisible = args.enabledBoards.includes(board.boardType);
      if (board.isVisible !== isVisible) {
        await ctx.db.patch(board._id, { isVisible });
      }
    }

    return { success: true };
  },
});

/**
 * Rename a project (updates name and regenerates slug)
 */
export const renameProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const newSlug = generateSlug(args.name);

    // Check if new slug conflicts with another project
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("byUserIdAndSlug", (q) =>
        q.eq("userId", userId).eq("slug", newSlug)
      )
      .first();

    if (existingProject && existingProject._id !== args.projectId) {
      throw new Error("A project with this name already exists");
    }

    // Update the project
    await ctx.db.patch(args.projectId, {
      name: args.name,
      slug: newSlug,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update project description
 */
export const updateProjectDescription = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    await ctx.db.patch(args.projectId, {
      description: args.description,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Toggle project public/private status
 */
export const toggleProjectPublicStatus = mutation({
  args: {
    projectId: v.id("projects"),
    isPublicViewOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    const project = await verifyProjectOwnership(ctx, args.projectId, userId);

    await ctx.db.patch(args.projectId, {
      isPublicViewOnly: args.isPublicViewOnly,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a project and all associated data (cascading delete)
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    // Delete all comments
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all votes
    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete all items
    const items = await ctx.db
      .query("projectItems")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete all columns
    const columns = await ctx.db
      .query("projectColumns")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const column of columns) {
      await ctx.db.delete(column._id);
    }

    // Delete all boards
    const boards = await ctx.db
      .query("projectBoards")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const board of boards) {
      await ctx.db.delete(board._id);
    }

    // Delete customization
    const customization = await ctx.db
      .query("projectCustomization")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (customization) {
      await ctx.db.delete(customization._id);
    }

    // Delete analytics
    const analytics = await ctx.db
      .query("projectAnalytics")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const analytic of analytics) {
      await ctx.db.delete(analytic._id);
    }

    // Finally, delete the project itself
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

/**
 * Create a new item (admin)
 */
export const createItem = mutation({
  args: {
    projectId: v.id("projects"),
    columnId: v.id("projectColumns"),
    boardId: v.optional(v.id("projectBoards")),
    title: v.string(),
    description: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    // Verify column belongs to project
    const column = await ctx.db.get(args.columnId);
    if (!column || column.projectId !== args.projectId) {
      throw new Error("Column not found or does not belong to this project");
    }

    // Get boardId from column if not provided
    const boardId = args.boardId || column.boardId;

    // Calculate position if not provided
    let position = args.position;
    if (position === undefined) {
      const existingItems = await ctx.db
        .query("projectItems")
        .withIndex("byProjectIdAndColumnId", (q) =>
          q.eq("projectId", args.projectId).eq("columnId", args.columnId)
        )
        .collect();

      const maxPosition = existingItems.reduce(
        (max, item) => Math.max(max, item.position),
        0
      );
      position = maxPosition + 1000;
    }

    // Determine status from column slug
    const statusMap: Record<string, "backlog" | "in-progress" | "review" | "done"> = {
      "backlog": "backlog",
      "in-progress": "in-progress",
      "review": "review",
      "done": "done",
    };
    const status = statusMap[column.slug] || "backlog";

    const now = Date.now();

    const itemId = await ctx.db.insert("projectItems", {
      projectId: args.projectId,
      boardId,
      columnId: args.columnId,
      title: args.title,
      description: args.description,
      position,
      voteCount: 0,
      commentCount: 0,
      status,
      createdByAdminId: userId,
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});

/**
 * Update an item
 */
export const updateItem = mutation({
  args: {
    itemId: v.id("projectItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership
    await verifyProjectOwnership(ctx, item.projectId, userId);

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    await ctx.db.patch(args.itemId, updates);

    return { success: true };
  },
});

/**
 * Delete an item
 */
export const deleteItem = mutation({
  args: {
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership
    await verifyProjectOwnership(ctx, item.projectId, userId);

    // Delete all votes for this item
    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete all comments for this item
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the item
    await ctx.db.delete(args.itemId);

    return { success: true };
  },
});

/**
 * Move an item to a different column
 */
export const moveItem = mutation({
  args: {
    itemId: v.id("projectItems"),
    targetColumnId: v.id("projectColumns"),
    targetPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership
    await verifyProjectOwnership(ctx, item.projectId, userId);

    // Verify target column belongs to same project
    const targetColumn = await ctx.db.get(args.targetColumnId);
    if (!targetColumn || targetColumn.projectId !== item.projectId) {
      throw new Error("Target column not found or does not belong to this project");
    }

    // Determine new status from column slug
    const statusMap: Record<string, "backlog" | "in-progress" | "review" | "done"> = {
      "backlog": "backlog",
      "in-progress": "in-progress",
      "review": "review",
      "done": "done",
    };
    const newStatus = statusMap[targetColumn.slug] || "backlog";

    await ctx.db.patch(args.itemId, {
      columnId: args.targetColumnId,
      position: args.targetPosition,
      status: newStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reorder an item within the same column
 */
export const reorderItem = mutation({
  args: {
    itemId: v.id("projectItems"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership
    await verifyProjectOwnership(ctx, item.projectId, userId);

    await ctx.db.patch(args.itemId, {
      position: args.newPosition,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Save project customization
 */
export const saveCustomization = mutation({
  args: {
    projectId: v.id("projects"),
    logoUrl: v.optional(v.string()),
    companyName: v.optional(v.string()),
    widgetTitle: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    cardBackgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    borderColor: v.optional(v.string()),
    darkPrimaryColor: v.optional(v.string()),
    darkSecondaryColor: v.optional(v.string()),
    darkBackgroundColor: v.optional(v.string()),
    darkCardBackgroundColor: v.optional(v.string()),
    darkTextColor: v.optional(v.string()),
    darkBorderColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    fontSize: v.optional(v.string()),
    headingFontFamily: v.optional(v.string()),
    borderRadius: v.optional(v.string()),
    spacing: v.optional(v.string()),
    customCss: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const now = Date.now();

    // Check if customization exists
    const existing = await ctx.db
      .query("projectCustomization")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .first();

    const customizationData = {
      logoUrl: args.logoUrl,
      companyName: args.companyName,
      widgetTitle: args.widgetTitle,
      primaryColor: args.primaryColor,
      secondaryColor: args.secondaryColor,
      backgroundColor: args.backgroundColor,
      cardBackgroundColor: args.cardBackgroundColor,
      textColor: args.textColor,
      borderColor: args.borderColor,
      darkPrimaryColor: args.darkPrimaryColor,
      darkSecondaryColor: args.darkSecondaryColor,
      darkBackgroundColor: args.darkBackgroundColor,
      darkCardBackgroundColor: args.darkCardBackgroundColor,
      darkTextColor: args.darkTextColor,
      darkBorderColor: args.darkBorderColor,
      fontFamily: args.fontFamily,
      fontSize: args.fontSize,
      headingFontFamily: args.headingFontFamily,
      borderRadius: args.borderRadius,
      spacing: args.spacing,
      customCss: args.customCss,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, customizationData);
    } else {
      await ctx.db.insert("projectCustomization", {
        projectId: args.projectId,
        ...customizationData,
        createdAt: now,
      });
    }

    return { success: true };
  },
});
