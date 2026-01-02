// @ts-nocheck
import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Cast a vote on an item (called from widget vote mutation)
 */
export const castVote = internalMutation({
  args: {
    clerkUserId: v.string(), // Clerk user ID
    itemId: v.id("projectItems"),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the item to verify it exists and get projectId
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify the item belongs to the correct API key owner
    const project = await ctx.db.get(item.projectId);
    if (!project || project.userId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("projectVotes")
      .withIndex("byItemIdAndClerkUserId", (q) =>
        q.eq("itemId", args.itemId).eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (existingVote) {
      throw new Error("Already voted");
    }

    // Create vote
    await ctx.db.insert("projectVotes", {
      clerkUserId: args.clerkUserId,
      itemId: args.itemId,
      projectId: item.projectId,
      createdAt: Date.now(),
    });

    // Increment vote count on item
    await ctx.db.patch(args.itemId, {
      voteCount: (item.voteCount || 0) + 1,
    });

    return { success: true };
  },
});

/**
 * Remove a vote from an item (called from widget unvote mutation)
 */
export const removeVote = internalMutation({
  args: {
    clerkUserId: v.string(), // Clerk user ID
    itemId: v.id("projectItems"),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify the item belongs to the correct API key owner
    const project = await ctx.db.get(item.projectId);
    if (!project || project.userId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Find the vote
    const existingVote = await ctx.db
      .query("projectVotes")
      .withIndex("byItemIdAndClerkUserId", (q) =>
        q.eq("itemId", args.itemId).eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (!existingVote) {
      throw new Error("Vote not found");
    }

    // Delete vote
    await ctx.db.delete(existingVote._id);

    // Decrement vote count on item
    await ctx.db.patch(args.itemId, {
      voteCount: Math.max(0, (item.voteCount || 0) - 1),
    });

    return { success: true };
  },
});

/**
 * Create a new item from widget user (called from widget createItem mutation)
 */
export const createWidgetItem = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    clerkUserId: v.string(), // Clerk user ID
    apiKeyUserId: v.string(),
  },
  returns: v.id("projectItems"),
  handler: async (ctx, args) => {
    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify the project belongs to the correct API key owner
    if (project.userId !== args.apiKeyUserId) {
      throw new Error("Access denied");
    }

    // Check if project allows submissions
    if (project.isPublicViewOnly) {
      throw new Error("This project does not allow submissions");
    }

    // Get the first column (backlog) for the project
    const columns = await ctx.db
      .query("projectColumns")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (columns.length === 0) {
      throw new Error("Project has no columns");
    }

    // Sort by order and get first column
    const firstColumn = columns.sort((a, b) => a.order - b.order)[0];

    // Get highest position in column
    const existingItems = await ctx.db
      .query("projectItems")
      .withIndex("byProjectIdAndColumnId", (q) =>
        q.eq("projectId", args.projectId).eq("columnId", firstColumn._id)
      )
      .collect();

    const maxPosition = existingItems.reduce(
      (max, item) => Math.max(max, item.position),
      0
    );

    const now = Date.now();

    // Create the item
    const itemId = await ctx.db.insert("projectItems", {
      projectId: args.projectId,
      columnId: firstColumn._id,
      title: args.title,
      description: args.description,
      position: maxPosition + 1,
      voteCount: 0,
      commentCount: 0, // Initialize comment count
      createdByUserId: args.clerkUserId,
      status: "backlog",
      createdAt: now,
      updatedAt: now,
    });

    return itemId;
  },
});
