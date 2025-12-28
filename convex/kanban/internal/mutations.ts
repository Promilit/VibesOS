import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * Create a new widget user (called from registration action)
 */
export const createWidgetUser = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    displayName: v.string(),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("widgetUsers", {
      email: args.email,
      passwordHash: args.passwordHash,
      displayName: args.displayName,
      apiKeyUserId: args.apiKeyUserId,
      emailVerified: false, // TODO: Implement email verification
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Create a new session (called from login/registration actions)
 */
export const createSession = internalMutation({
  args: {
    userId: v.id("widgetUsers"),
    tokenHash: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("widgetSessions", {
      userId: args.userId,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

/**
 * Delete expired sessions (called from cron)
 */
export const deleteExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query("widgetSessions")
      .withIndex("byExpiresAt")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    let deletedCount = 0;
    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
