/**
 * Internal mutation to create API key (called from Node.js action)
 * SECURITY: Requires authentication, user can only create keys for themselves
 */
export declare const createApiKeyInternal: import('convex/server').RegisteredMutation<"internal", {
    expiresAt?: number | undefined;
    name: string;
    keyHash: string;
    keyPrefix: string;
}, Promise<{
    id: import('convex/values').GenericId<"apiKeys">;
    keyPrefix: string;
    name: string;
    createdAt: number;
    expiresAt: number | undefined;
}>>;
/**
 * Get all API keys for the authenticated user
 * SECURITY: User can only see their own API keys
 */
export declare const getUserApiKeys: import('convex/server').RegisteredQuery<"public", {}, Promise<{
    id: import('convex/values').GenericId<"apiKeys">;
    name: string;
    keyPrefix: string;
    createdAt: number;
    lastUsed: number | undefined;
    expiresAt: number | undefined;
    isActive: boolean;
}[]>>;
/**
 * Revoke (deactivate) an API key
 * SECURITY: User can only revoke their own keys
 */
export declare const revokeApiKey: import('convex/server').RegisteredMutation<"public", {
    keyId: import('convex/values').GenericId<"apiKeys">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Delete an API key permanently
 * SECURITY: User can only delete their own keys
 */
export declare const deleteApiKey: import('convex/server').RegisteredMutation<"public", {
    keyId: import('convex/values').GenericId<"apiKeys">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Internal mutation to verify an API key (called from Node.js action)
 * SECURITY: This will be called by your API routes to validate keys
 */
export declare const verifyApiKeyInternal: import('convex/server').RegisteredMutation<"internal", {
    keyHash: string;
}, Promise<{
    valid: boolean;
    reason: string;
    userId?: undefined;
    keyId?: undefined;
} | {
    valid: boolean;
    userId: string;
    keyId: import('convex/values').GenericId<"apiKeys">;
    reason?: undefined;
}>>;
