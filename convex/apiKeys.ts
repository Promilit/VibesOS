import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";

// Helper function to get authenticated user ID from Clerk
async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return identity.subject; // This is the Clerk user ID
}

/**
 * Internal mutation to create API key (called from Node.js action)
 * SECURITY: Requires authentication, user can only create keys for themselves
 */
export const createApiKeyInternal = internalMutation({
  args: {
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user ID from Clerk
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to create API keys");
    }

    // Store in database (never store the full key, only the hash)
    const apiKeyId = await ctx.db.insert("apiKeys", {
      userId,
      name: args.name,
      keyHash: args.keyHash,
      keyPrefix: args.keyPrefix,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
      isActive: true,
    });

    return {
      id: apiKeyId,
      keyPrefix: args.keyPrefix,
      name: args.name,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    };
  },
});

/**
 * Get all API keys for the authenticated user
 * SECURITY: User can only see their own API keys
 */
export const getUserApiKeys = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    // Fetch only this user's API keys
    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    // Fetch all projects to check which API keys are linked
    const projects = await ctx.db
      .query("projects")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    // Create a map of apiKeyId -> project name
    const apiKeyToProject = new Map<string, string>();
    for (const project of projects) {
      if (project.apiKeyId) {
        apiKeyToProject.set(project.apiKeyId, project.name);
      }
    }

    // Return sanitized data (never return keyHash)
    return apiKeys.map((key) => ({
      id: key._id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      linkedProject: apiKeyToProject.get(key._id) || null,
    }));
  },
});

/**
 * Revoke (deactivate) an API key
 * SECURITY: User can only revoke their own keys
 */
export const revokeApiKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    // Get the API key
    const apiKey = await ctx.db.get(args.keyId);
    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Verify ownership
    if (apiKey.userId !== userId) {
      throw new Error("Unauthorized: You can only revoke your own API keys");
    }

    // Deactivate the key
    await ctx.db.patch(args.keyId, {
      isActive: false,
    });

    return { success: true };
  },
});

/**
 * Delete an API key permanently
 * SECURITY: User can only delete their own keys
 */
export const deleteApiKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    // Get the API key
    const apiKey = await ctx.db.get(args.keyId);
    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Verify ownership
    if (apiKey.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own API keys");
    }

    // Delete the key
    await ctx.db.delete(args.keyId);

    return { success: true };
  },
});

/**
 * Internal mutation to verify an API key (called from Node.js action)
 * SECURITY: This will be called by your API routes to validate keys
 */
export const verifyApiKeyInternal = internalMutation({
  args: {
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the key in database
    const apiKeyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("byKeyHash", (q) => q.eq("keyHash", args.keyHash))
      .first();

    if (!apiKeyRecord) {
      return { valid: false, reason: "Invalid API key" };
    }

    // Check if active
    if (!apiKeyRecord.isActive) {
      return { valid: false, reason: "API key has been revoked" };
    }

    // Check if expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < Date.now()) {
      return { valid: false, reason: "API key has expired" };
    }

    // Update last used timestamp
    await ctx.db.patch(apiKeyRecord._id, {
      lastUsed: Date.now(),
    });

    return {
      valid: true,
      userId: apiKeyRecord.userId,
      keyId: apiKeyRecord._id,
    };
  },
});
