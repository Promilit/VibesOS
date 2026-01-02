// @ts-nocheck
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { verifyProjectOwnership } from "../lib/permissions";

/**
 * Get all comments for an item (with threading support)
 */
export const getItemComments = query({
  args: {
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get the item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify ownership of the project
    await verifyProjectOwnership(ctx, item.projectId, userId);

    // Get all comments for this item
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("byItemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    // Filter out deleted comments (but keep them for threading)
    // Sort by creation time
    const sortedComments = comments.sort((a, b) => a.createdAt - b.createdAt);

    // Organize into threads
    const topLevelComments = sortedComments.filter((c) => !c.parentCommentId);
    const commentsByParent = new Map<string, typeof comments>();

    sortedComments.forEach((comment) => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId;
        if (!commentsByParent.has(parentId)) {
          commentsByParent.set(parentId, []);
        }
        commentsByParent.get(parentId)!.push(comment);
      }
    });

    // Build threaded structure
    const buildThread = (comment: typeof comments[0]): any => {
      const replies = commentsByParent.get(comment._id) || [];
      return {
        ...comment,
        replies: replies.map(buildThread),
      };
    };

    return topLevelComments.map(buildThread);
  },
});

/**
 * Get comment count for an item
 */
export const getCommentCount = query({
  args: {
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      return 0;
    }

    return item.commentCount || 0;
  },
});
