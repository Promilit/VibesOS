/**
 * Get all projects for the authenticated user
 */
export declare const getProjects: import('convex/server').RegisteredQuery<"public", {}, Promise<{
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
 * Get a single project with all its columns
 */
export declare const getProject: import('convex/server').RegisteredQuery<"public", {
    projectId: import('convex/values').GenericId<"projects">;
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
}>>;
/**
 * Get all items for a project
 */
export declare const getProjectItems: import('convex/server').RegisteredQuery<"public", {
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
 * Get items for a specific column
 */
export declare const getColumnItems: import('convex/server').RegisteredQuery<"public", {
    projectId: import('convex/values').GenericId<"projects">;
    columnId: import('convex/values').GenericId<"projectColumns">;
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
 * Get project customization
 */
export declare const getCustomization: import('convex/server').RegisteredQuery<"public", {
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
 * Get all project boards for a project
 */
export declare const getProjectBoards: import('convex/server').RegisteredQuery<"public", {
    projectId: import('convex/values').GenericId<"projects">;
}, Promise<{
    _id: import('convex/values').GenericId<"projectBoards">;
    _creationTime: number;
    projectId: import('convex/values').GenericId<"projects">;
    name: string;
    createdAt: number;
    boardType: "feature-requests" | "bug-reports" | "internal-roadmap";
    isVisible: boolean;
    order: number;
}[]>>;
/**
 * Get project items organized by column for a specific board (for kanban board)
 */
export declare const getBoardItems: import('convex/server').RegisteredQuery<"public", {
    boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
    projectId: import('convex/values').GenericId<"projects">;
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
    itemsByColumn: Record<string, any[]>;
}>>;
/**
 * Get vote count for an item
 */
export declare const getItemVoteCount: import('convex/server').RegisteredQuery<"public", {
    itemId: import('convex/values').GenericId<"projectItems">;
}, Promise<number>>;
/**
 * Get all voters for an item (for admin view)
 */
export declare const getItemVoters: import('convex/server').RegisteredQuery<"public", {
    itemId: import('convex/values').GenericId<"projectItems">;
}, Promise<{
    clerkUserId: string;
    createdAt: number;
}[]>>;
