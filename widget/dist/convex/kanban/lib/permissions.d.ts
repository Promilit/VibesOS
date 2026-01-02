import { QueryCtx, MutationCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';
/**
 * Get authenticated admin user ID from Clerk
 * Returns null if not authenticated
 */
export declare function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null>;
/**
 * Get authenticated admin user ID from Clerk (throws if not authenticated)
 */
export declare function requireAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string>;
/**
 * Check if a board belongs to the given admin user
 */
export declare function verifyBoardOwnership(ctx: QueryCtx | MutationCtx, boardId: Id<"kanbanBoards">, adminUserId: string): Promise<void>;
/**
 * Check if an item belongs to the given Clerk user
 * Returns true if user owns the item
 */
export declare function checkItemOwnership(ctx: QueryCtx | MutationCtx, itemId: Id<"kanbanItems">, clerkUserId: string): Promise<boolean>;
/**
 * Require that a Clerk user owns an item (throws if not)
 */
export declare function requireItemOwnership(ctx: QueryCtx | MutationCtx, itemId: Id<"kanbanItems">, clerkUserId: string): Promise<void>;
/**
 * Check if a user can vote on an item
 * Returns error message if cannot vote, null if can vote
 */
export declare function checkCanVote(ctx: QueryCtx | MutationCtx, itemId: Id<"kanbanItems">, clerkUserId: string): Promise<string | null>;
/**
 * Verify that a column belongs to a board
 */
export declare function verifyColumnBelongsToBoard(ctx: QueryCtx | MutationCtx, columnId: Id<"kanbanColumns">, boardId: Id<"kanbanBoards">): Promise<void>;
/**
 * Check if a column allows end users to add items
 */
export declare function canAddItemsToColumn(ctx: QueryCtx | MutationCtx, columnId: Id<"kanbanColumns">): Promise<boolean>;
