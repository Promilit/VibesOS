"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { validateEmail, validatePassword } from "../lib/auth";

/**
 * JWT secret - should be set in environment variables in production
 */
function getJwtSecret(): string {
  return process.env.JWT_SECRET || "uservibes-widget-jwt-secret-change-in-production";
}

/**
 * Generate a JWT token
 */
function generateJwtToken(payload: {
  userId: string;
  apiKeyUserId: string;
  email: string;
}): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Create signature
  const secret = getJwtSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Hash a token for database storage
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Register a new widget user
 * Validates email/password, hashes password with bcrypt, generates JWT token
 */
export const registerUser: any = action({
  args: {
    apiKey: v.string(),
    email: v.string(),
    password: v.string(),
    displayName: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    token: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<any> => {
    try {
      // 1. Verify API key by hashing and calling internal mutation
      const keyHash = crypto.createHash("sha256").update(args.apiKey).digest("hex");
      const apiKeyVerification = await ctx.runMutation(
        internal.apiKeys.verifyApiKeyInternal,
        { keyHash }
      );

      if (!apiKeyVerification.valid) {
        return {
          success: false,
          error: apiKeyVerification.reason || "Invalid API key",
        };
      }

      const apiKeyUserId = apiKeyVerification.userId!;

      // 2. Validate email format
      if (!validateEmail(args.email)) {
        return { success: false, error: "Invalid email format" };
      }

      // 3. Validate password strength
      const passwordValidation = validatePassword(args.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // 4. Validate display name
      if (args.displayName.trim().length < 2) {
        return { success: false, error: "Display name must be at least 2 characters" };
      }

      // 5. Check if user already exists (scoped to this API key owner)
      const existingUser = await ctx.runQuery(
        internal.kanban.internal.queries.getUserByEmail as any,
        {
          email: args.email.toLowerCase(),
          apiKeyUserId,
        }
      );

      if (existingUser) {
        return { success: false, error: "User with this email already exists" };
      }

      // 6. Hash password with bcrypt (cost factor 12)
      const passwordHash = await bcrypt.hash(args.password, 12);

      // 7. Create user
      const userId = await ctx.runMutation(
        internal.kanban.internal.mutations.createWidgetUser as any,
        {
          email: args.email.toLowerCase(),
          passwordHash,
          displayName: args.displayName.trim(),
          apiKeyUserId,
        }
      );

      // 8. Generate JWT token
      const token = generateJwtToken({
        userId,
        apiKeyUserId,
        email: args.email.toLowerCase(),
      });

      // 9. Hash and store session
      const tokenHash = hashToken(token);
      await ctx.runMutation(
        internal.kanban.internal.mutations.createSession as any,
        {
          userId,
          tokenHash,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        }
      );

      return {
        success: true,
        token,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  },
});

/**
 * Login a widget user
 * Verifies credentials with bcrypt, generates JWT token
 */
export const loginUser: any = action({
  args: {
    apiKey: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    token: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<any> => {
    try {
      // 1. Verify API key by hashing and calling internal mutation
      const keyHash = crypto.createHash("sha256").update(args.apiKey).digest("hex");
      const apiKeyVerification = await ctx.runMutation(
        internal.apiKeys.verifyApiKeyInternal,
        { keyHash }
      );

      if (!apiKeyVerification.valid) {
        return {
          success: false,
          error: apiKeyVerification.reason || "Invalid API key",
        };
      }

      const apiKeyUserId = apiKeyVerification.userId!;

      // 2. Get user by email (scoped to API key owner)
      const user = await ctx.runQuery(
        internal.kanban.internal.queries.getUserByEmail as any,
        {
          email: args.email.toLowerCase(),
          apiKeyUserId,
        }
      );

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      // 3. Verify password with bcrypt
      const passwordMatch = await bcrypt.compare(args.password, user.passwordHash);

      if (!passwordMatch) {
        return { success: false, error: "Invalid email or password" };
      }

      // 4. Generate JWT token
      const token = generateJwtToken({
        userId: user._id,
        apiKeyUserId,
        email: user.email,
      });

      // 5. Hash and store session
      const tokenHash = hashToken(token);
      await ctx.runMutation(
        internal.kanban.internal.mutations.createSession as any,
        {
          userId: user._id,
          tokenHash,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        }
      );

      return {
        success: true,
        token,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },
});
