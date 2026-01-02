// @ts-nocheck
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";

/**
 * Vote on an item (requires Clerk authentication)
 */
export const vote = mutation({
  args: {
    apiKeyHash: v.string(),
    itemId: v.id("kanbanItems"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Not authenticated" };
    }

    const clerkUserId = identity.subject; // Clerk user ID

    try {
      // Verify API key
      const apiKey = await ctx.db
        .query("apiKeys")
        .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
        .first();

      if (!apiKey || !apiKey.isActive) {
        return { success: false, error: "Invalid API key" };
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
        return { success: false, error: "API key has expired" };
      }

      // Cast the vote
      await ctx.runMutation(internal.kanban.internal.mutations.castVote, {
        clerkUserId,
        itemId: args.itemId,
        apiKeyUserId: apiKey.userId,
      });

      // Update lastUsed on API key
      await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to vote";
      return { success: false, error: message };
    }
  },
});

/**
 * Remove a vote from an item (requires Clerk authentication)
 */
export const unvote = mutation({
  args: {
    apiKeyHash: v.string(),
    itemId: v.id("kanbanItems"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Not authenticated" };
    }

    const clerkUserId = identity.subject;

    try {
      // Verify API key
      const apiKey = await ctx.db
        .query("apiKeys")
        .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
        .first();

      if (!apiKey || !apiKey.isActive) {
        return { success: false, error: "Invalid API key" };
      }

      if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
        return { success: false, error: "API key has expired" };
      }

      // Remove the vote
      await ctx.runMutation(internal.kanban.internal.mutations.removeVote, {
        clerkUserId,
        itemId: args.itemId,
        apiKeyUserId: apiKey.userId,
      });

      // Update lastUsed on API key
      await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove vote";
      return { success: false, error: message };
    }
  },
});

/**
 * Create a new item (widget user submission, requires Clerk authentication)
 */
export const createItem = mutation({
  args: {
    apiKeyHash: v.string(),
    boardId: v.id("kanbanBoards"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    itemId: v.optional(v.id("kanbanItems")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get authenticated user from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, error: "Not authenticated" };
    }

    const clerkUserId = identity.subject;

    try {
      // Verify API key
      const apiKey = await ctx.db
        .query("apiKeys")
        .withIndex("byKeyHash", (q) => q.eq("keyHash", args.apiKeyHash))
        .first();

      if (!apiKey || !apiKey.isActive) {
        return { success: false, error: "Invalid API key" };
      }

      if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
        return { success: false, error: "API key has expired" };
      }

      // Validate input
      if (!args.title.trim()) {
        return { success: false, error: "Title is required" };
      }

      if (args.title.length > 200) {
        return { success: false, error: "Title is too long (max 200 characters)" };
      }

      if (args.description && args.description.length > 2000) {
        return { success: false, error: "Description is too long (max 2000 characters)" };
      }

      // Create the item
      const newItemId: Id<"kanbanItems"> = await ctx.runMutation(
        internal.kanban.internal.mutations.createWidgetItem,
        {
          boardId: args.boardId,
          title: args.title.trim(),
          description: args.description?.trim(),
          clerkUserId,
          apiKeyUserId: apiKey.userId,
        }
      );

      // Update lastUsed on API key
      await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

      return { success: true, itemId: newItemId };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create item";
      return { success: false, error: message };
    }
  },
});
