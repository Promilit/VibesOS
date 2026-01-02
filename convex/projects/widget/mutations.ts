// @ts-nocheck
import { v } from "convex/values";
import { mutation, internalMutation } from "../../_generated/server";
import { verifyApiKey } from "../lib/permissions";
import { internal } from "../../_generated/api";

/**
 * Track API key usage (update lastUsed timestamp)
 * Called from actions to track query usage
 */
export const trackApiKeyUsage = mutation({
  args: {
    apiKeyHash: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);
    await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });
    return { success: true };
  },
});

/**
 * Vote on an item (from widget)
 */
export const vote = mutation({
  args: {
    apiKeyHash: v.string(),
    clerkUserId: v.string(),
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Update lastUsed
    await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

    // Call internal mutation directly (not via scheduler)
    return await ctx.runMutation(internal.projects.internal.mutations.castVote, {
      clerkUserId: args.clerkUserId,
      itemId: args.itemId,
      apiKeyUserId: apiKey.userId,
    });
  },
});

/**
 * Remove vote from an item (from widget)
 */
export const unvote = mutation({
  args: {
    apiKeyHash: v.string(),
    clerkUserId: v.string(),
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Update lastUsed
    await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

    // Call internal mutation directly
    return await ctx.runMutation(internal.projects.internal.mutations.removeVote, {
      clerkUserId: args.clerkUserId,
      itemId: args.itemId,
      apiKeyUserId: apiKey.userId,
    });
  },
});

/**
 * Create a new item (from widget)
 */
export const createItem = mutation({
  args: {
    apiKeyHash: v.string(),
    clerkUserId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Update lastUsed
    await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });

    // Call internal mutation directly
    const itemId = await ctx.runMutation(
      internal.projects.internal.mutations.createWidgetItem,
      {
        projectId: args.projectId,
        title: args.title,
        description: args.description,
        clerkUserId: args.clerkUserId,
        apiKeyUserId: apiKey.userId,
      }
    );

    return { itemId };
  },
});
