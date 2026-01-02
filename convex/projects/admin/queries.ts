// @ts-nocheck
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { verifyProjectOwnership } from "../lib/permissions";

/**
 * Get all projects for the authenticated user
 */
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const projects = await ctx.db
      .query("projects")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    // Sort by most recently updated
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/**
 * Get a single project with all its columns
 */
export const getProject = query({
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
    const project = await verifyProjectOwnership(ctx, args.projectId, userId);

    // Get columns
    const columns = await ctx.db
      .query("projectColumns")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Sort by order
    const sortedColumns = columns.sort((a, b) => a.order - b.order);

    return {
      ...project,
      columns: sortedColumns,
    };
  },
});

/**
 * Get all items for a project
 */
export const getProjectItems = query({
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

    const items = await ctx.db
      .query("projectItems")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return items;
  },
});

/**
 * Get items for a specific column
 */
export const getColumnItems = query({
  args: {
    projectId: v.id("projects"),
    columnId: v.id("projectColumns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const items = await ctx.db
      .query("projectItems")
      .withIndex("byProjectIdAndColumnId", (q) =>
        q.eq("projectId", args.projectId).eq("columnId", args.columnId)
      )
      .collect();

    // Sort by position
    return items.sort((a, b) => a.position - b.position);
  },
});

/**
 * Get project customization
 */
export const getCustomization = query({
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

    const customization = await ctx.db
      .query("projectCustomization")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .first();

    return customization || null;
  },
});

/**
 * Get all project boards for a project
 */
export const getProjectBoards = query({
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

    const boards = await ctx.db
      .query("projectBoards")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Sort by order and return only visible boards
    return boards
      .filter((b) => b.isVisible)
      .sort((a, b) => a.order - b.order);
  },
});

/**
 * Get project items organized by column for a specific board (for kanban board)
 */
export const getBoardItems = query({
  args: {
    projectId: v.id("projects"),
    boardId: v.optional(v.id("projectBoards")), // Optional for backward compatibility
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    // Get columns - filter by boardId if provided
    let columns;
    if (args.boardId) {
      columns = await ctx.db
        .query("projectColumns")
        .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
        .collect();
    } else {
      // Backward compatibility: get columns without boardId or first board's columns
      columns = await ctx.db
        .query("projectColumns")
        .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
        .collect();

      // Filter to only columns without boardId (legacy) or first board
      columns = columns.filter((c) => !c.boardId);

      // If no legacy columns, get first board's columns
      if (columns.length === 0) {
        const firstBoard = await ctx.db
          .query("projectBoards")
          .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
          .first();

        if (firstBoard) {
          columns = await ctx.db
            .query("projectColumns")
            .withIndex("byBoardId", (q) => q.eq("boardId", firstBoard._id))
            .collect();
        }
      }
    }

    // Sort by order
    const sortedColumns = columns.sort((a, b) => a.order - b.order);

    // Get items - filter by boardId if provided
    let allItems;
    if (args.boardId) {
      allItems = await ctx.db
        .query("projectItems")
        .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
        .collect();
    } else {
      allItems = await ctx.db
        .query("projectItems")
        .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
        .collect();

      // Filter to only items without boardId (legacy)
      allItems = allItems.filter((i) => !i.boardId);
    }

    // Organize items by column
    const itemsByColumn: Record<string, any[]> = {};

    for (const column of sortedColumns) {
      const columnItems = allItems
        .filter((item) => item.columnId === column._id)
        .sort((a, b) => a.position - b.position);

      itemsByColumn[column._id] = columnItems;
    }

    return {
      columns: sortedColumns,
      itemsByColumn,
    };
  },
});

/**
 * Get vote count for an item
 */
export const getItemVoteCount = query({
  args: {
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    return item?.voteCount || 0;
  },
});

/**
 * Get all voters for an item (for admin view)
 */
export const getItemVoters = query({
  args: {
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership of the project
    await verifyProjectOwnership(ctx, item.projectId, identity.subject);

    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    return votes.map((vote) => ({
      clerkUserId: vote.clerkUserId,
      createdAt: vote.createdAt,
    }));
  },
});
