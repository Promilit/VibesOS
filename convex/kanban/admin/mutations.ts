/**
 * Admin mutations for kanban board management
 * These functions are only accessible to authenticated Clerk users (admins)
 */

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireAuthUserId, verifyBoardOwnership } from "../lib/permissions";
import { calculatePosition, calculatePositionAtEnd } from "../lib/positions";
import { Id } from "../../_generated/dataModel";

/**
 * Initialize the 3 default boards with 4 columns each for a customer
 * Should be called once per customer when they first access kanban
 */
export const initializeBoards = mutation({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    // Check if boards already exist
    const existingBoards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .collect();

    if (existingBoards.length > 0) {
      throw new Error("Boards already initialized for this user");
    }

    const now = Date.now();

    // Define the 3 boards
    const boardConfigs = [
      {
        name: "Feature Requests",
        slug: "feature-requests",
        description: "User-submitted feature requests",
        isPublicViewOnly: false,
        order: 0,
      },
      {
        name: "Bug Reports",
        slug: "bug-reports",
        description: "User-reported bugs and issues",
        isPublicViewOnly: false,
        order: 1,
      },
      {
        name: "Internal Roadmap",
        slug: "internal-roadmap",
        description: "Internal product roadmap (view-only for users)",
        isPublicViewOnly: true,
        order: 2,
      },
    ];

    // Define the 4 columns
    const columnConfigs = [
      {
        name: "Backlog",
        slug: "backlog",
        order: 0,
        canAddItems: true, // End users can only add to Backlog
      },
      {
        name: "In Progress",
        slug: "in-progress",
        order: 1,
        canAddItems: false,
      },
      {
        name: "Review",
        slug: "review",
        order: 2,
        canAddItems: false,
      },
      {
        name: "Done",
        slug: "done",
        order: 3,
        canAddItems: false,
      },
    ];

    // Create boards and their columns
    for (const boardConfig of boardConfigs) {
      const boardId = await ctx.db.insert("kanbanBoards", {
        apiKeyUserId: adminUserId,
        name: boardConfig.name,
        slug: boardConfig.slug,
        description: boardConfig.description,
        isPublicViewOnly: boardConfig.isPublicViewOnly,
        order: boardConfig.order,
        createdAt: now,
      });

      // Create columns for this board
      for (const columnConfig of columnConfigs) {
        await ctx.db.insert("kanbanColumns", {
          boardId,
          name: columnConfig.name,
          slug: columnConfig.slug,
          order: columnConfig.order,
          canAddItems: columnConfig.canAddItems,
          createdAt: now,
        });
      }
    }

    return { success: true, message: "Boards initialized successfully" };
  },
});

/**
 * Create a new kanban item (admin only)
 */
export const createItem = mutation({
  args: {
    boardId: v.id("kanbanBoards"),
    columnId: v.id("kanbanColumns"),
    title: v.string(),
    description: v.optional(v.string()),
    position: v.optional(v.number()), // If not provided, will be placed at end
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);
    await verifyBoardOwnership(ctx, args.boardId, adminUserId);

    // Verify column belongs to board
    const column = await ctx.db.get(args.columnId);
    if (!column || column.boardId !== args.boardId) {
      throw new Error("Column does not belong to this board");
    }

    const now = Date.now();

    // Calculate position if not provided
    let position = args.position;
    if (position === undefined) {
      // Get max position in this column
      const items = await ctx.db
        .query("kanbanItems")
        .withIndex("byBoardIdAndColumnId", (q) =>
          q.eq("boardId", args.boardId).eq("columnId", args.columnId)
        )
        .collect();

      const maxPosition = items.length > 0
        ? Math.max(...items.map((item) => item.position))
        : null;

      position = calculatePositionAtEnd(maxPosition);
    }

    // Map column slug to status
    const statusMap: Record<string, "backlog" | "in-progress" | "review" | "done"> = {
      "backlog": "backlog",
      "in-progress": "in-progress",
      "review": "review",
      "done": "done",
    };

    const status = statusMap[column.slug] || "backlog";

    const itemId = await ctx.db.insert("kanbanItems", {
      boardId: args.boardId,
      columnId: args.columnId,
      title: args.title,
      description: args.description,
      createdByAdminId: adminUserId,
      position,
      voteCount: 0,
      status,
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});

/**
 * Update an existing kanban item (admin only)
 */
export const updateItem = mutation({
  args: {
    itemId: v.id("kanbanItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await verifyBoardOwnership(ctx, item.boardId, adminUserId);

    const updates: {
      title?: string;
      description?: string;
      updatedAt: number;
    } = {
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
 * Delete a kanban item (admin only)
 */
export const deleteItem = mutation({
  args: {
    itemId: v.id("kanbanItems"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await verifyBoardOwnership(ctx, item.boardId, adminUserId);

    // Delete all votes for this item
    const votes = await ctx.db
      .query("kanbanVotes")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the item
    await ctx.db.delete(args.itemId);

    return { success: true };
  },
});

/**
 * Move an item to a different column (drag-and-drop)
 */
export const moveItem = mutation({
  args: {
    itemId: v.id("kanbanItems"),
    targetColumnId: v.id("kanbanColumns"),
    targetPosition: v.number(), // New position in target column
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await verifyBoardOwnership(ctx, item.boardId, adminUserId);

    const targetColumn = await ctx.db.get(args.targetColumnId);
    if (!targetColumn || targetColumn.boardId !== item.boardId) {
      throw new Error("Invalid target column");
    }

    // Map column slug to status
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
    itemId: v.id("kanbanItems"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await verifyBoardOwnership(ctx, item.boardId, adminUserId);

    await ctx.db.patch(args.itemId, {
      position: args.newPosition,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Save widget customization settings
 */
export const saveCustomization = mutation({
  args: {
    // Branding
    logoUrl: v.optional(v.string()),
    companyName: v.optional(v.string()),
    widgetTitle: v.optional(v.string()),

    // Light mode colors
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    cardBackgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    borderColor: v.optional(v.string()),

    // Dark mode colors
    darkPrimaryColor: v.optional(v.string()),
    darkSecondaryColor: v.optional(v.string()),
    darkBackgroundColor: v.optional(v.string()),
    darkCardBackgroundColor: v.optional(v.string()),
    darkTextColor: v.optional(v.string()),
    darkBorderColor: v.optional(v.string()),

    // Typography
    fontFamily: v.optional(v.string()),
    fontSize: v.optional(v.string()),
    headingFontFamily: v.optional(v.string()),

    // Spacing & Layout
    borderRadius: v.optional(v.string()),
    spacing: v.optional(v.string()),

    // Custom CSS
    customCss: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);

    // Check if customization already exists
    const existing = await ctx.db
      .query("widgetCustomization")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .first();

    const now = Date.now();

    const customizationData = {
      apiKeyUserId: adminUserId,
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
      return { success: true, customizationId: existing._id };
    } else {
      const id = await ctx.db.insert("widgetCustomization", {
        ...customizationData,
        createdAt: now,
      });
      return { success: true, customizationId: id };
    }
  },
});

/**
 * Reset widget customization to defaults (deletes customization)
 */
export const resetCustomization = mutation({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const existing = await ctx.db
      .query("widgetCustomization")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});
