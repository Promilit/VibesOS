// @ts-nocheck
import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

/**
 * Get votes for a user on a specific board
 * Used to show which items the user has already voted on
 */
export const getUserVotesForBoard = internalQuery({
  args: {
    clerkUserId: v.string(),
    boardId: v.id("kanbanBoards"),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("kanbanVotes")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .filter((q) => q.eq(q.field("boardId"), args.boardId))
      .collect();

    return votes.map((v) => v.itemId);
  },
});
