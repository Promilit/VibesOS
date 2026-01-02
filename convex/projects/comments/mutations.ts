// @ts-nocheck
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { verifyProjectOwnership, verifyCommentOwnership, isProjectAdmin } from "../lib/permissions";

/**
 * Create a comment on an item (admin only)
 */
export const createComment = mutation({
  args: {
    itemId: v.id("projectItems"),
    content: v.string(),
    parentCommentId: v.optional(v.id("projectComments")),
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

    // Verify parent comment exists and belongs to same item
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.itemId !== args.itemId) {
        throw new Error("Parent comment does not belong to this item");
      }
    }

    const now = Date.now();

    // Create the comment
    const commentId = await ctx.db.insert("projectComments", {
      itemId: args.itemId,
      projectId: item.projectId,
      authorId: userId,
      authorType: "admin",
      content: args.content,
      parentCommentId: args.parentCommentId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Increment comment count on item
    await ctx.db.patch(args.itemId, {
      commentCount: (item.commentCount || 0) + 1,
      updatedAt: now,
    });

    return commentId;
  },
});

/**
 * Update a comment (edit)
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("projectComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership of comment
    const comment = await verifyCommentOwnership(ctx, args.commentId, userId);

    if (comment.isDeleted) {
      throw new Error("Cannot edit deleted comment");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a comment (soft delete)
 * Can be deleted by comment author or project admin
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("projectComments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check permissions: author or project admin can delete
    const isAuthor = comment.authorId === userId;
    const isAdmin = await isProjectAdmin(ctx, comment.projectId, userId);

    if (!isAuthor && !isAdmin) {
      throw new Error("Access denied: You can only delete your own comments or you must be a project admin");
    }

    if (comment.isDeleted) {
      throw new Error("Comment already deleted");
    }

    const now = Date.now();

    // Soft delete the comment
    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      content: "[deleted]",
      updatedAt: now,
    });

    // Decrement comment count on item
    const item = await ctx.db.get(comment.itemId);
    if (item) {
      await ctx.db.patch(comment.itemId, {
        commentCount: Math.max(0, (item.commentCount || 0) - 1),
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
