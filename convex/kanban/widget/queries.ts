import { v } from "convex/values";
import { query } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Get boards for an API key (public widget query)
 * This is called by the embedded widget with an API key
 */
export const getBoards = query({
  args: { apiKeyHash: v.string() },
  handler: async (ctx, args): Promise<Array<{
    _id: Id<"kanbanBoards">;
    name: string;
    slug: string;
    description?: string;
    isPublicViewOnly: boolean;
    order: number;
    columns: Doc<"kanbanColumns">[];
  }>> => {
    // Look up API key by hash to get user ID
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
      .first();

    if (!apiKey || !apiKey.isActive) {
      throw new Error("Invalid or inactive API key");
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      throw new Error("API key has expired");
    }

    const apiKeyUserId = apiKey.userId;

    // Get boards for this user
    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", apiKeyUserId))
      .order("asc")
      .collect();

    // Get columns for each board
    const boardsWithColumns = await Promise.all(
      boards.map(async (board) => {
        const columns = await ctx.db
          .query("kanbanColumns")
          .withIndex("byBoardId", (q) => q.eq("boardId", board._id))
          .order("asc")
          .collect();

        return {
          _id: board._id,
          name: board.name,
          slug: board.slug,
          description: board.description,
          isPublicViewOnly: board.isPublicViewOnly,
          order: board.order,
          columns: columns.sort((a, b) => a.order - b.order),
        };
      })
    );

    return boardsWithColumns.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get items for a board (optionally filtered by column)
 */
export const getItems = query({
  args: {
    apiKeyHash: v.string(),
    boardId: v.id("kanbanBoards"),
    columnId: v.optional(v.id("kanbanColumns")),
  },
  handler: async (ctx, args): Promise<Doc<"kanbanItems">[]> => {
    // Verify API key
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
      .first();

    if (!apiKey || !apiKey.isActive) {
      throw new Error("Invalid or inactive API key");
    }

    // Verify board ownership
    const board = await ctx.db.get(args.boardId);
    if (!board || board.apiKeyUserId !== apiKey.userId) {
      throw new Error("Board not found or access denied");
    }

    // Get items based on whether columnId is provided
    let items: Doc<"kanbanItems">[];

    if (args.columnId) {
      items = await ctx.db
        .query("kanbanItems")
        .withIndex("byBoardIdAndColumnId", (q) =>
          q.eq("boardId", args.boardId).eq("columnId", args.columnId!)
        )
        .collect();
    } else {
      items = await ctx.db
        .query("kanbanItems")
        .withIndex("byBoardId", (q) => q.eq("boardId", args.boardId))
        .collect();
    }

    return items.sort((a, b) => a.position - b.position);
  },
});

/**
 * Get user's votes for a board
 * Returns array of item IDs the user has voted on
 * Uses Clerk authentication
 */
export const getUserVotes = query({
  args: {
    apiKeyHash: v.string(),
    boardId: v.id("kanbanBoards"),
  },
  handler: async (ctx, args): Promise<Id<"kanbanItems">[]> => {
    // Get authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Not authenticated, no votes
    }

    const clerkUserId = identity.subject;

    // Verify API key
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
      .first();

    if (!apiKey || !apiKey.isActive) {
      throw new Error("Invalid or inactive API key");
    }

    // Verify board belongs to this API key owner
    const board = await ctx.db.get(args.boardId);
    if (!board || board.apiKeyUserId !== apiKey.userId) {
      throw new Error("Board not found or access denied");
    }

    // Get votes for this user on this board
    const votes = await ctx.db
      .query("kanbanVotes")
      .withIndex("byItemIdAndClerkUserId")
      .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
      .filter((q) => q.eq(q.field("boardId"), args.boardId))
      .collect();

    return votes.map((vote) => vote.itemId);
  },
});

/**
 * Get customization for an API key
 * Returns customization settings or null (client uses defaults)
 */
export const getCustomization = query({
  args: { apiKeyHash: v.string() },
  handler: async (ctx, args): Promise<Doc<"widgetCustomization"> | null> => {
    // Verify API key
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
      .first();

    if (!apiKey || !apiKey.isActive) {
      throw new Error("Invalid or inactive API key");
    }

    // Get customization
    const customization = await ctx.db
      .query("widgetCustomization")
      .withIndex("byApiKeyUserId", (q) => q.eq("apiKeyUserId", apiKey.userId))
      .first();

    return customization || null;
  },
});
