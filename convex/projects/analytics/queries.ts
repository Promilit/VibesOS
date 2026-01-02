// @ts-nocheck
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { verifyProjectOwnership } from "../lib/permissions";

/**
 * Get comprehensive analytics for a project
 */
export const getProjectAnalytics = query({
  args: {
    projectId: v.id("projects"),
    startDate: v.optional(v.number()), // Timestamp
    endDate: v.optional(v.number()),   // Timestamp
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const now = Date.now();
    const startDate = args.startDate || now - 30 * 24 * 60 * 60 * 1000; // Default: 30 days ago
    const endDate = args.endDate || now;

    // Get all items for the project
    const allItems = await ctx.db
      .query("projectItems")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Filter items by date range
    const itemsInRange = allItems.filter(
      (item) => item.createdAt >= startDate && item.createdAt <= endDate
    );

    // Get all votes for the project
    const allVotes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const votesInRange = allVotes.filter(
      (vote) => vote.createdAt >= startDate && vote.createdAt <= endDate
    );

    // Get all comments for the project
    const allComments = await ctx.db
      .query("projectComments")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const commentsInRange = allComments.filter(
      (comment) => comment.createdAt >= startDate && comment.createdAt <= endDate
    );

    // Calculate summary metrics
    const totalItems = allItems.length;
    const totalVotes = allItems.reduce((sum, item) => sum + item.voteCount, 0);
    const totalComments = allItems.reduce((sum, item) => sum + item.commentCount, 0);

    // Status breakdown
    const itemsBacklog = allItems.filter((item) => item.status === "backlog").length;
    const itemsInProgress = allItems.filter((item) => item.status === "in-progress").length;
    const itemsReview = allItems.filter((item) => item.status === "review").length;
    const itemsDone = allItems.filter((item) => item.status === "done").length;

    // New items/votes/comments in range
    const newItemsCount = itemsInRange.length;
    const newVotesCount = votesInRange.length;
    const newCommentsCount = commentsInRange.length;

    // Unique active users (who voted or commented in range)
    const activeUserIds = new Set([
      ...votesInRange.map((vote) => vote.clerkUserId),
      ...commentsInRange.map((comment) => comment.authorId),
    ]);
    const activeUsers = activeUserIds.size;

    // Top items by votes
    const topItems = [...allItems]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 10)
      .map((item) => ({
        id: item._id,
        title: item.title,
        voteCount: item.voteCount,
        commentCount: item.commentCount,
        status: item.status,
      }));

    // Top voters
    const voterCounts = new Map<string, number>();
    allVotes.forEach((vote) => {
      voterCounts.set(vote.clerkUserId, (voterCounts.get(vote.clerkUserId) || 0) + 1);
    });

    const topVoters = Array.from(voterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({
        userId,
        voteCount: count,
      }));

    return {
      summary: {
        totalItems,
        totalVotes,
        totalComments,
        activeUsers,
        newItemsCount,
        newVotesCount,
        newCommentsCount,
      },
      statusBreakdown: {
        backlog: itemsBacklog,
        inProgress: itemsInProgress,
        review: itemsReview,
        done: itemsDone,
      },
      topItems,
      topVoters,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },
});

/**
 * Get vote trends over time (daily aggregation)
 */
export const getVoteTrends = query({
  args: {
    projectId: v.id("projects"),
    days: v.optional(v.number()), // Number of days to look back (default: 30)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    // Get all votes in the time range
    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const votesInRange = votes.filter((vote) => vote.createdAt >= startDate);

    // Aggregate by day
    const dailyVotes = new Map<string, number>();

    votesInRange.forEach((vote) => {
      const date = new Date(vote.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      dailyVotes.set(dateKey, (dailyVotes.get(dateKey) || 0) + 1);
    });

    // Fill in missing days with 0
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      trends.unshift({
        date: dateKey,
        votes: dailyVotes.get(dateKey) || 0,
      });
    }

    return trends;
  },
});

/**
 * Get activity trends over time (items, votes, comments)
 */
export const getActivityTrends = query({
  args: {
    projectId: v.id("projects"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    // Get all data in range
    const items = await ctx.db
      .query("projectItems")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const comments = await ctx.db
      .query("projectComments")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const itemsInRange = items.filter((item) => item.createdAt >= startDate);
    const votesInRange = votes.filter((vote) => vote.createdAt >= startDate);
    const commentsInRange = comments.filter((comment) => comment.createdAt >= startDate);

    // Aggregate by day
    const dailyActivity = new Map<string, { items: number; votes: number; comments: number }>();

    itemsInRange.forEach((item) => {
      const date = new Date(item.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const current = dailyActivity.get(dateKey) || { items: 0, votes: 0, comments: 0 };
      current.items++;
      dailyActivity.set(dateKey, current);
    });

    votesInRange.forEach((vote) => {
      const date = new Date(vote.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const current = dailyActivity.get(dateKey) || { items: 0, votes: 0, comments: 0 };
      current.votes++;
      dailyActivity.set(dateKey, current);
    });

    commentsInRange.forEach((comment) => {
      const date = new Date(comment.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const current = dailyActivity.get(dateKey) || { items: 0, votes: 0, comments: 0 };
      current.comments++;
      dailyActivity.set(dateKey, current);
    });

    // Fill in missing days
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const activity = dailyActivity.get(dateKey) || { items: 0, votes: 0, comments: 0 };

      trends.unshift({
        date: dateKey,
        items: activity.items,
        votes: activity.votes,
        comments: activity.comments,
      });
    }

    return trends;
  },
});

/**
 * Get user engagement metrics
 */
export const getUserEngagement = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify ownership
    await verifyProjectOwnership(ctx, args.projectId, userId);

    // Get all votes and comments
    const votes = await ctx.db
      .query("projectVotes")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const comments = await ctx.db
      .query("projectComments")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Calculate user stats
    const userStats = new Map<string, { votes: number; comments: number }>();

    votes.forEach((vote) => {
      const current = userStats.get(vote.clerkUserId) || { votes: 0, comments: 0 };
      current.votes++;
      userStats.set(vote.clerkUserId, current);
    });

    comments.forEach((comment) => {
      if (!comment.isDeleted) {
        const current = userStats.get(comment.authorId) || { votes: 0, comments: 0 };
        current.comments++;
        userStats.set(comment.authorId, current);
      }
    });

    // Sort by total engagement (votes + comments)
    const engagementList = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        votes: stats.votes,
        comments: stats.comments,
        totalEngagement: stats.votes + stats.comments,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 20); // Top 20 users

    return {
      totalUsers: userStats.size,
      topUsers: engagementList,
    };
  },
});
