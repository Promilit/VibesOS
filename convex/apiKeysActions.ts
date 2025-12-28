"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import crypto from "crypto";

// Helper function to hash API keys
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// Helper function to generate a secure API key
function generateApiKey(): { fullKey: string; keyHash: string; keyPrefix: string } {
  // Format: uvos_<32 random hex chars>
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const fullKey = `uvos_${randomBytes}`;
  const keyHash = hashApiKey(fullKey);
  const keyPrefix = fullKey.substring(0, 12); // "uvos_" + first 7 chars

  return { fullKey, keyHash, keyPrefix };
}

/**
 * Create a new API key for the authenticated user (Node.js action)
 * This action generates the key using crypto and then calls a mutation to store it
 */
export const createApiKey: any = action({
  args: {
    name: v.string(),
    expiresInDays: v.optional(v.number()),
  },
  returns: v.object({
    id: v.string(),
    fullKey: v.string(),
    keyPrefix: v.string(),
    name: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }),
  handler: async (ctx, args): Promise<any> => {
    // Generate secure API key using Node.js crypto
    const { fullKey, keyHash, keyPrefix } = generateApiKey();

    // Calculate expiration if provided
    const expiresAt = args.expiresInDays
      ? Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Call the mutation to store in database
    const result: any = await ctx.runMutation(internal.apiKeys.createApiKeyInternal as any, {
      name: args.name,
      keyHash,
      keyPrefix,
      expiresAt,
    });

    // Return the full key ONLY on creation (user must save it)
    return {
      id: result.id,
      fullKey,
      keyPrefix: result.keyPrefix,
      name: result.name,
      createdAt: result.createdAt,
      expiresAt: result.expiresAt,
    };
  },
});

/**
 * Verify an API key (Node.js action)
 * This action hashes the key and then calls a query to verify it
 */
export const verifyApiKey: any = action({
  args: {
    apiKey: v.string(),
  },
  returns: v.union(
    v.object({
      valid: v.literal(false),
      reason: v.string(),
    }),
    v.object({
      valid: v.literal(true),
      userId: v.string(),
      keyId: v.string(),
    })
  ),
  handler: async (ctx, args): Promise<any> => {
    // Hash the provided key using Node.js crypto
    const keyHash = hashApiKey(args.apiKey);

    // Call the mutation to verify and update last used
    const result: any = await ctx.runMutation(internal.apiKeys.verifyApiKeyInternal as any, {
      keyHash,
    });

    return result;
  },
});
