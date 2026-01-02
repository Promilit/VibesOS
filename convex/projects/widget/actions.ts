// @ts-nocheck
import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

/**
 * Get all projects for a given API key (for widget display)
 * This is an action so we can update lastUsed timestamp
 */
export const getProjects = action({
  args: {
    apiKeyHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Update API key lastUsed via mutation
    await ctx.runMutation(api.projects.widget.mutations.trackApiKeyUsage, {
      apiKeyHash: args.apiKeyHash,
    });

    // Query projects
    return await ctx.runQuery(api.projects.widget.queries.getProjectsInternal, {
      apiKeyHash: args.apiKeyHash,
    });
  },
});

/**
 * Get all items for a project (for widget display)
 */
export const getItems = action({
  args: {
    apiKeyHash: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Update API key lastUsed
    await ctx.runMutation(api.projects.widget.mutations.trackApiKeyUsage, {
      apiKeyHash: args.apiKeyHash,
    });

    // Query items
    return await ctx.runQuery(api.projects.widget.queries.getItemsInternal, {
      apiKeyHash: args.apiKeyHash,
      projectId: args.projectId,
    });
  },
});

/**
 * Get user's votes for a project
 */
export const getUserVotes = action({
  args: {
    apiKeyHash: v.string(),
    clerkUserId: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Update API key lastUsed
    await ctx.runMutation(api.projects.widget.mutations.trackApiKeyUsage, {
      apiKeyHash: args.apiKeyHash,
    });

    // Query votes
    return await ctx.runQuery(api.projects.widget.queries.getUserVotesInternal, {
      apiKeyHash: args.apiKeyHash,
      clerkUserId: args.clerkUserId,
      projectId: args.projectId,
    });
  },
});

/**
 * Get customization for a specific project
 */
export const getCustomization = action({
  args: {
    apiKeyHash: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Update API key lastUsed
    await ctx.runMutation(api.projects.widget.mutations.trackApiKeyUsage, {
      apiKeyHash: args.apiKeyHash,
    });

    // Query customization
    return await ctx.runQuery(api.projects.widget.queries.getCustomizationInternal, {
      apiKeyHash: args.apiKeyHash,
      projectId: args.projectId,
    });
  },
});

/**
 * Get a single item by ID (for detail view)
 */
export const getItem = action({
  args: {
    apiKeyHash: v.string(),
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    // Update API key lastUsed
    await ctx.runMutation(api.projects.widget.mutations.trackApiKeyUsage, {
      apiKeyHash: args.apiKeyHash,
    });

    // Query item
    return await ctx.runQuery(api.projects.widget.queries.getItemInternal, {
      apiKeyHash: args.apiKeyHash,
      itemId: args.itemId,
    });
  },
});
