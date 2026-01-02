/**
 * Internal query: Get all projects for a given API key (for widget display)
 * Called from action that tracks API key usage
 */
export declare const getProjectsInternal: import('convex/server').RegisteredQuery<"public", {
    apiKeyHash: string;
}, Promise<{
    columns: {
        _id: import('convex/values').GenericId<"projectColumns">;
        _creationTime: number;
        boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
        projectId: import('convex/values').GenericId<"projects">;
        name: string;
        slug: string;
        createdAt: number;
        order: number;
        canAddItems: boolean;
    }[];
    _id: import('convex/values').GenericId<"projects">;
    _creationTime: number;
    description?: string | undefined;
    apiKeyId?: import('convex/values').GenericId<"apiKeys"> | undefined;
    enabledBoards?: string[] | undefined;
    name: string;
    slug: string;
    userId: string;
    createdAt: number;
    isPublicViewOnly: boolean;
    updatedAt: number;
}[]>>;
/**
 * Internal query: Get all items for a project (for widget display)
 */
export declare const getItemsInternal: import('convex/server').RegisteredQuery<"public", {
    apiKeyHash: string;
    projectId: import('convex/values').GenericId<"projects">;
}, Promise<{
    _id: import('convex/values').GenericId<"projectItems">;
    _creationTime: number;
    description?: string | undefined;
    boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
    createdByUserId?: string | undefined;
    createdByAdminId?: string | undefined;
    title: string;
    projectId: import('convex/values').GenericId<"projects">;
    status: "backlog" | "in-progress" | "review" | "done";
    createdAt: number;
    updatedAt: number;
    columnId: import('convex/values').GenericId<"projectColumns">;
    position: number;
    voteCount: number;
    commentCount: number;
}[]>>;
/**
 * Internal query: Get user's votes for a project
 */
export declare const getUserVotesInternal: import('convex/server').RegisteredQuery<"public", {
    apiKeyHash: string;
    projectId: import('convex/values').GenericId<"projects">;
    clerkUserId: string;
}, Promise<import('convex/values').GenericId<"projectItems">[]>>;
/**
 * Internal query: Get customization for a specific project
 */
export declare const getCustomizationInternal: import('convex/server').RegisteredQuery<"public", {
    apiKeyHash: string;
    projectId: import('convex/values').GenericId<"projects">;
}, Promise<{
    _id: import('convex/values').GenericId<"projectCustomization">;
    _creationTime: number;
    darkPrimaryColor?: string | undefined;
    darkSecondaryColor?: string | undefined;
    darkBackgroundColor?: string | undefined;
    darkCardBackgroundColor?: string | undefined;
    darkTextColor?: string | undefined;
    darkBorderColor?: string | undefined;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    backgroundColor?: string | undefined;
    cardBackgroundColor?: string | undefined;
    textColor?: string | undefined;
    borderColor?: string | undefined;
    fontFamily?: string | undefined;
    fontSize?: string | undefined;
    headingFontFamily?: string | undefined;
    borderRadius?: string | undefined;
    spacing?: string | undefined;
    customCss?: string | undefined;
    logoUrl?: string | undefined;
    companyName?: string | undefined;
    widgetTitle?: string | undefined;
    projectId: import('convex/values').GenericId<"projects">;
    createdAt: number;
    updatedAt: number;
} | null>>;
/**
 * Internal query: Get a single item by ID (for detail view)
 */
export declare const getItemInternal: import('convex/server').RegisteredQuery<"public", {
    apiKeyHash: string;
    itemId: import('convex/values').GenericId<"projectItems">;
}, Promise<{
    _id: import('convex/values').GenericId<"projectItems">;
    _creationTime: number;
    description?: string | undefined;
    boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
    createdByUserId?: string | undefined;
    createdByAdminId?: string | undefined;
    title: string;
    projectId: import('convex/values').GenericId<"projects">;
    status: "backlog" | "in-progress" | "review" | "done";
    createdAt: number;
    updatedAt: number;
    columnId: import('convex/values').GenericId<"projectColumns">;
    position: number;
    voteCount: number;
    commentCount: number;
}>>;
