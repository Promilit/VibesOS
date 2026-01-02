/**
 * Cast a vote on an item (called from widget vote mutation)
 */
export declare const castVote: import('convex/server').RegisteredMutation<"internal", {
    itemId: import('convex/values').GenericId<"projectItems">;
    clerkUserId: string;
    apiKeyUserId: string;
}, Promise<{
    success: boolean;
}>>;
/**
 * Remove a vote from an item (called from widget unvote mutation)
 */
export declare const removeVote: import('convex/server').RegisteredMutation<"internal", {
    itemId: import('convex/values').GenericId<"projectItems">;
    clerkUserId: string;
    apiKeyUserId: string;
}, Promise<{
    success: boolean;
}>>;
/**
 * Create a new item from widget user (called from widget createItem mutation)
 */
export declare const createWidgetItem: import('convex/server').RegisteredMutation<"internal", {
    description?: string | undefined;
    title: string;
    projectId: import('convex/values').GenericId<"projects">;
    clerkUserId: string;
    apiKeyUserId: string;
}, Promise<import('convex/values').GenericId<"projectItems">>>;
