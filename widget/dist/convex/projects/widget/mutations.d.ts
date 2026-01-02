/**
 * Track API key usage (update lastUsed timestamp)
 * Called from actions to track query usage
 */
export declare const trackApiKeyUsage: import('convex/server').RegisteredMutation<"public", {
    apiKeyHash: string;
}, Promise<{
    success: boolean;
}>>;
/**
 * Vote on an item (from widget)
 */
export declare const vote: any;
/**
 * Remove vote from an item (from widget)
 */
export declare const unvote: any;
/**
 * Create a new item (from widget)
 */
export declare const createItem: any;
