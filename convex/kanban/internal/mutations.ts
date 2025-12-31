import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Cast a vote on an item (called from widget vote mutation)
 */
export const castVote = internalMutation({
  args: {
    clerkUserId: v.string(), // Clerk user ID
    itemId: v.id("kanbanItems"),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the item to verify it exists and get boardId
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify the item belongs to the correct API key owner
    const board = await ctx.db.get(item.boardId);
    if (!board || board.apiKeyUserId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("kanbanVotes")
      .withIndex("byItemIdAndClerkUserId", (q) =>
        q.eq("itemId", args.itemId).eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (existingVote) {
      throw new Error("Already voted");
    }

    // Create vote
    await ctx.db.insert("kanbanVotes", {
      clerkUserId: args.clerkUserId,
      itemId: args.itemId,
      boardId: item.boardId,
      createdAt: Date.now(),
    });

    // Increment vote count on item
    await ctx.db.patch(args.itemId, {
      voteCount: (item.voteCount || 0) + 1,
    });

    return { success: true };
  },
});

/**
 * Remove a vote from an item (called from widget unvote mutation)
 */
export const removeVote = internalMutation({
  args: {
    clerkUserId: v.string(), // Clerk user ID
    itemId: v.id("kanbanItems"),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify the item belongs to the correct API key owner
    const board = await ctx.db.get(item.boardId);
    if (!board || board.apiKeyUserId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Find the vote
    const existingVote = await ctx.db
      .query("kanbanVotes")
      .withIndex("byItemIdAndClerkUserId", (q) =>
        q.eq("itemId", args.itemId).eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (!existingVote) {
      throw new Error("Vote not found");
    }

    // Delete vote
    await ctx.db.delete(existingVote._id);

    // Decrement vote count on item
    await ctx.db.patch(args.itemId, {
      voteCount: Math.max(0, (item.voteCount || 0) - 1),
    });

    return { success: true };
  },
});

/**
 * Create a new item from widget user (called from widget createItem mutation)
 */
export const createWidgetItem = internalMutation({
  args: {
    boardId: v.id("kanbanBoards"),
    title: v.string(),
    description: v.optional(v.string()),
    clerkUserId: v.string(), // Clerk user ID
    apiKeyUserId: v.string(),
  },
  returns: v.id("kanbanItems"),
  handler: async (ctx, args) => {
    // Get the board
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Verify the board belongs to the correct API key owner
    if (board.apiKeyUserId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Check if board allows submissions
    if (board.isPublicViewOnly) {
      throw new Error("This board does not allow submissions");
    }

    // Get the first column (backlog) for the board
    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
      .collect();

    if (columns.length === 0) {
      throw new Error("Board has no columns");
    }

    // Sort by order and get first column
    const firstColumn = columns.sort((a, b) => a.order - b.order)[0];

    // Get highest position in column
    const existingItems = await ctx.db
      .query("kanbanItems")
      .withIndex("byBoardIdAndColumnId", (q) =>
        q.eq("boardId", args.boardId).eq("columnId", firstColumn._id)
      )
      .collect();

    const maxPosition = existingItems.reduce(
      (max, item) => Math.max(max, item.position),
      0
    );

    const now = Date.now();

    // Create the item
    const itemId = await ctx.db.insert("kanbanItems", {
      boardId: args.boardId,
      columnId: firstColumn._id,
      title: args.title,
      description: args.description,
      position: maxPosition + 1,
      voteCount: 0,
      createdByUserId: args.clerkUserId,
      status: "backlog",
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});
