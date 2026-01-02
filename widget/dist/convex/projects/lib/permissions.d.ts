import { QueryCtx, MutationCtx } from '../../_generated/server';
import { Doc, Id } from '../../_generated/dataModel';
/**
 * Verify that an API key exists and is valid
 * Returns the API key document if valid, throws otherwise
 */
export declare function verifyApiKey(ctx: QueryCtx | MutationCtx, apiKeyHash: string): Promise<Doc<"apiKeys">>;
/**
 * Verify that a user owns a project
 */
export declare function verifyProjectOwnership(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">, userId: string): Promise<Doc<"projects">>;
/**
 * Verify that a user can access a project via API key
 */
export declare function verifyProjectAccessViaApiKey(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">, apiKeyUserId: string): Promise<Doc<"projects">>;
/**
 * Check if a user can vote on an item
 */
export declare function checkCanVote(ctx: QueryCtx | MutationCtx, itemId: Id<"projectItems">, clerkUserId: string): Promise<boolean>;
/**
 * Get project by ID and verify it exists
 */
export declare function getProject(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">): Promise<Doc<"projects">>;
/**
 * Verify that a comment belongs to a user (for deletion permissions)
 */
export declare function verifyCommentOwnership(ctx: QueryCtx | MutationCtx, commentId: Id<"projectComments">, userId: string): Promise<Doc<"projectComments">>;
/**
 * Check if a user is an admin (project owner)
 */
export declare function isProjectAdmin(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">, userId: string): Promise<boolean>;
