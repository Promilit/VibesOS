// @ts-nocheck
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Verify that an API key exists and is valid
 * Returns the API key document if valid, throws otherwise
 */
export async function verifyApiKey(
  ctx: QueryCtx | MutationCtx,
  apiKeyHash: string
): Promise<Doc<"apiKeys">> {
  const apiKey = await ctx.db
    .query("apiKeys")
    .withIndex("byKeyHash", (q) => q.eq("keyHash", apiKeyHash))
    .first();

  if (!apiKey) {
    throw new Error("Invalid API key");
  }

  if (!apiKey.isActive) {
    throw new Error("API key is inactive");
  }

  if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
    throw new Error("API key has expired");
  }

  return apiKey;
}

/**
 * Verify that a user owns a project
 */
export async function verifyProjectOwnership(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: string
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== userId) {
    throw new Error("Access denied: You do not own this project");
  }

  return project;
}

/**
 * Verify that a user can access a project via API key
 */
export async function verifyProjectAccessViaApiKey(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  apiKeyUserId: string
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== apiKeyUserId) {
    throw new Error("Access denied: This project does not belong to your API key");
  }

  return project;
}

/**
 * Check if a user can vote on an item
 */
export async function checkCanVote(
  ctx: QueryCtx | MutationCtx,
  itemId: Id<"projectItems">,
  clerkUserId: string
): Promise<boolean> {
  const existingVote = await ctx.db
    .query("projectVotes")
    .withIndex("byItemIdAndClerkUserId", (q) =>
      q.eq("itemId", itemId).eq("clerkUserId", clerkUserId)
    )
    .first();

  return !existingVote;
}

/**
 * Get project by ID and verify it exists
 */
export async function getProject(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

/**
 * Verify that a comment belongs to a user (for deletion permissions)
 */
export async function verifyCommentOwnership(
  ctx: QueryCtx | MutationCtx,
  commentId: Id<"projectComments">,
  userId: string
): Promise<Doc<"projectComments">> {
  const comment = await ctx.db.get(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new Error("Access denied: You do not own this comment");
  }

  return comment;
}

/**
 * Check if a user is an admin (project owner)
 */
export async function isProjectAdmin(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: string
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  return project?.userId === userId;
}
