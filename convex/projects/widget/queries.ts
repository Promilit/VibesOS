// @ts-nocheck
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { verifyApiKey } from "../lib/permissions";

/**
 * Internal query: Get all projects for a given API key (for widget display)
 * Called from action that tracks API key usage
 */
export const getProjectsInternal = query({
  args: {
    apiKeyHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify API key and get it
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Get all projects for this API key's user
    const projects = await ctx.db
      .query("projects")
      .withIndex("byUserId", (q) => q.eq("userId", apiKey.userId))
      .collect();

    // Get columns for each project
    const projectsWithColumns = await Promise.all(
      projects.map(async (project) => {
        const columns = await ctx.db
          .query("projectColumns")
          .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          columns: columns.sort((a, b) => a.order - b.order),
        };
      })
    );

    return projectsWithColumns;
  },
});

/**
 * Internal query: Get all items for a project (for widget display)
 */
export const getItemsInternal = query({
  args: {
    apiKeyHash: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Verify project belongs to API key owner
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== apiKey.userId) {
      throw new Error("Access denied");
    }

    // Get all items for this project
    const items = await ctx.db
      .query("projectItems")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return items;
  },
});

/**
 * Internal query: Get user's votes for a project
 */
export const getUserVotesInternal = query({
  args: {
    apiKeyHash: v.string(),
    clerkUserId: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Verify project belongs to API key owner
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== apiKey.userId) {
      throw new Error("Access denied");
    }

    // Get all votes for this user in this project
    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Filter to only this user's votes
    const userVotes = votes.filter((vote) => vote.clerkUserId === args.clerkUserId);

    // Return array of item IDs the user has voted on
    return userVotes.map((vote) => vote.itemId);
  },
});

/**
 * Internal query: Get customization for a specific project
 */
export const getCustomizationInternal = query({
  args: {
    apiKeyHash: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    // Verify project belongs to API key owner
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== apiKey.userId) {
      throw new Error("Access denied");
    }

    // Get customization for this project
    const customization = await ctx.db
      .query("projectCustomization")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .first();

    return customization || null;
  },
});

/**
 * Internal query: Get a single item by ID (for detail view)
 */
export const getItemInternal = query({
  args: {
    apiKeyHash: v.string(),
    itemId: v.id("projectItems"),
  },
  handler: async (ctx, args) => {
    // Verify API key
    const apiKey = await verifyApiKey(ctx, args.apiKeyHash);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify item belongs to a project owned by API key owner
    const project = await ctx.db.get(item.projectId);
    if (!project || project.userId !== apiKey.userId) {
      throw new Error("Access denied");
    }

    return item;
  },
});
