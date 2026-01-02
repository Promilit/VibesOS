// @ts-nocheck
/**
 * Permission checking helpers for kanban items and boards
 */

import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Get authenticated admin user ID from Clerk
 * Returns null if not authenticated
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return identity.subject; // This is the Clerk user ID
}

/**
 * Get authenticated admin user ID from Clerk (throws if not authenticated)
 */
export async function requireAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized: Must be logged in");
  }
  return userId;
}

/**
 * Check if a board belongs to the given admin user
 */
export async function verifyBoardOwnership(
  ctx: QueryCtx | MutationCtx,
  boardId: Id<"kanbanBoards">,
  adminUserId: string
): Promise<void> {
  const board = await ctx.db.get(boardId);
  if (!board) {
    throw new Error("Board not found");
  }
  if (board.apiKeyUserId !== adminUserId) {
    throw new Error("Unauthorized: You do not own this board");
  }
}

/**
 * Check if an item belongs to the given Clerk user
 * Returns true if user owns the item
 */
export async function checkItemOwnership(
  ctx: QueryCtx | MutationCtx,
  itemId: Id<"kanbanItems">,
  clerkUserId: string
): Promise<boolean> {
  const item = await ctx.db.get(itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  return item.createdByUserId === clerkUserId;
}

/**
 * Require that a Clerk user owns an item (throws if not)
 */
export async function requireItemOwnership(
  ctx: QueryCtx | MutationCtx,
  itemId: Id<"kanbanItems">,
  clerkUserId: string
): Promise<void> {
  const isOwner = await checkItemOwnership(ctx, itemId, clerkUserId);
  if (!isOwner) {
    throw new Error("Unauthorized: You can only modify your own items");
  }
}

/**
 * Check if a user can vote on an item
 * Returns error message if cannot vote, null if can vote
 */
export async function checkCanVote(
  ctx: QueryCtx | MutationCtx,
  itemId: Id<"kanbanItems">,
  clerkUserId: string
): Promise<string | null> {
  const item = await ctx.db.get(itemId);
  if (!item) {
    return "Item not found";
  }

  // Cannot vote on own items
  if (item.createdByUserId === clerkUserId) {
    return "Cannot vote on your own item";
  }

  // Check if already voted using the new index
  const existingVote = await ctx.db
    .query("kanbanVotes")
    .withIndex("byItemIdAndClerkUserId", (q) =>
      q.eq("itemId", itemId).eq("clerkUserId", clerkUserId)
    )
    .first();

  if (existingVote) {
    return "You have already voted on this item";
  }

  return null; // Can vote
}

/**
 * Verify that a column belongs to a board
 */
export async function verifyColumnBelongsToBoard(
  ctx: QueryCtx | MutationCtx,
  columnId: Id<"kanbanColumns">,
  boardId: Id<"kanbanBoards">
): Promise<void> {
  const column = await ctx.db.get(columnId);
  if (!column) {
    throw new Error("Column not found");
  }
  if (column.boardId !== boardId) {
    throw new Error("Column does not belong to this board");
  }
}

/**
 * Check if a column allows end users to add items
 */
export async function canAddItemsToColumn(
  ctx: QueryCtx | MutationCtx,
  columnId: Id<"kanbanColumns">
): Promise<boolean> {
  const column = await ctx.db.get(columnId);
  if (!column) {
    return false;
  }
  return column.canAddItems;
}
