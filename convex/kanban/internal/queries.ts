import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

/**
 * Get a widget user by email (scoped to API key owner)
 * Used for checking if user exists during registration/login
 */
export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
    apiKeyUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("widgetUsers")
      .withIndex("byEmailAndApiKeyUserId", (q) =>
        q.eq("email", args.email).eq("apiKeyUserId", args.apiKeyUserId)
      )
      .first();

    return user;
  },
});

/**
 * Get a widget user by ID
 */
export const getUserById = internalQuery({
  args: {
    userId: v.id("widgetUsers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get a session by token hash
 */
export const getSessionByTokenHash = internalQuery({
  args: {
    tokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("widgetSessions")
      .withIndex("byTokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .first();

    return session;
  },
});
