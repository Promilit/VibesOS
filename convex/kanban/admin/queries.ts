/**
 * Admin queries for kanban board management
 * These functions are only accessible to authenticated Clerk users (admins)
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireAuthUserId, verifyBoardOwnership } from "../lib/permissions";

/**
 * Get all boards for the authenticated admin user
 */
export const getBoards = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .order("asc")
      .collect();

    // Sort by order field
    return boards.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get a single board with its columns
 */
export const getBoardWithColumns = query({
  args: {
    boardId: v.id("kanbanBoards"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);
    await verifyBoardOwnership(ctx, args.boardId, adminUserId);

    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    // Sort columns by order
    const sortedColumns = columns.sort((a, b) => a.order - b.order);

    return {
      ...board,
      columns: sortedColumns,
    };
  },
});

/**
 * Get all items for a specific board, grouped by column
 */
export const getBoardItems = query({
  args: {
    boardId: v.id("kanbanBoards"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAuthUserId(ctx);
    await verifyBoardOwnership(ctx, args.boardId, adminUserId);

    const items = await ctx.db
      .query("kanbanItems")
      .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    // Get columns for this board
    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    // Group items by column
    const itemsByColumn: Record<string, typeof items> = {};

    for (const column of columns) {
      const columnItems = items
        .filter((item) => item.columnId === column._id)
        .sort((a, b) => a.position - b.position);

      itemsByColumn[column._id] = columnItems;
    }

    return {
      columns: columns.sort((a, b) => a.order - b.order),
      itemsByColumn,
    };
  },
});

/**
 * Get a single item with its details and votes
 */
export const getItem = query({
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

    // Get votes for this item
    const votes = await ctx.db
      .query("kanbanVotes")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    // Get voter information
    const votersWithDetails = await Promise.all(
      votes.map(async (vote) => {
        const user = await ctx.db.get(vote.userId);
        return {
          voteId: vote._id,
          userId: vote.userId,
          displayName: user?.displayName || "Unknown User",
          email: user?.email || "",
          createdAt: vote.createdAt,
        };
      })
    );

    // Get creator information
    let creatorInfo = null;
    if (item.createdByUserId) {
      const creator = await ctx.db.get(item.createdByUserId);
      if (creator) {
        creatorInfo = {
          displayName: creator.displayName,
          email: creator.email,
        };
      }
    }

    return {
      ...item,
      votes: votersWithDetails,
      creator: creatorInfo,
    };
  },
});

/**
 * Get all items across all boards for the admin user
 */
export const getAllItems = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .collect();

    const boardIds = boards.map((b) => b._id);

    // Get all items for all boards
    const allItems = [];
    for (const boardId of boardIds) {
      const items = await ctx.db
        .query("kanbanItems")
        .withIndex("byBoardId", (q) => q.eq("boardId", boardId))
        .collect();
      allItems.push(...items);
    }

    return allItems.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get customization settings for the admin user
 */
export const getCustomization = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const customization = await ctx.db
      .query("widgetCustomization")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .first();

    if (!customization) {
      // Return default values
      return {
        apiKeyUserId: adminUserId,
        // Defaults will be handled by the frontend
        logoUrl: undefined,
        companyName: undefined,
        widgetTitle: undefined,
        primaryColor: undefined,
        secondaryColor: undefined,
        backgroundColor: undefined,
        cardBackgroundColor: undefined,
        textColor: undefined,
        borderColor: undefined,
        darkPrimaryColor: undefined,
        darkSecondaryColor: undefined,
        darkBackgroundColor: undefined,
        darkCardBackgroundColor: undefined,
        darkTextColor: undefined,
        darkBorderColor: undefined,
        fontFamily: undefined,
        fontSize: undefined,
        headingFontFamily: undefined,
        borderRadius: undefined,
        spacing: undefined,
        customCss: undefined,
      };
    }

    return customization;
  },
});

/**
 * Check if boards have been initialized for the admin user
 */
export const areBoardsInitialized = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .collect();

    return {
      initialized: boards.length > 0,
      boardCount: boards.length,
    };
  },
});

/**
 * Get statistics for the admin dashboard
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await requireAuthUserId(ctx);

    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .collect();

    const boardIds = boards.map((b) => b._id);

    let totalItems = 0;
    let totalVotes = 0;
    let itemsByStatus = {
      backlog: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
    };

    for (const boardId of boardIds) {
      const items = await ctx.db
        .query("kanbanItems")
        .withIndex("byBoardId", (q) => q.eq("boardId", boardId))
        .collect();

      totalItems += items.length;

      for (const item of items) {
        itemsByStatus[item.status]++;
        totalVotes += item.voteCount;
      }
    }

    // Get widget user count
    const widgetUsers = await ctx.db
      .query("widgetUsers")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", adminUserId))
      .collect();

    return {
      totalBoards: boards.length,
      totalItems,
      totalVotes,
      totalWidgetUsers: widgetUsers.length,
      itemsByStatus,
    };
  },
});
