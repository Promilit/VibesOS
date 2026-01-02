/**
 * Create a new project with 3 boards and default columns
 */
export declare const createProject: import('convex/server').RegisteredMutation<"public", {
    description?: string | undefined;
    apiKeyId?: import('convex/values').GenericId<"apiKeys"> | undefined;
    enabledBoards?: string[] | undefined;
    name: string;
    isPublicViewOnly: boolean;
}, Promise<import('convex/values').GenericId<"projects">>>;
/**
 * Update which boards are visible/enabled for a project
 */
export declare const updateProjectBoards: import('convex/server').RegisteredMutation<"public", {
    projectId: import('convex/values').GenericId<"projects">;
    enabledBoards: string[];
}, Promise<{
    success: boolean;
}>>;
/**
 * Rename a project (updates name and regenerates slug)
 */
export declare const renameProject: import('convex/server').RegisteredMutation<"public", {
    projectId: import('convex/values').GenericId<"projects">;
    name: string;
}, Promise<{
    success: boolean;
}>>;
/**
 * Update project description
 */
export declare const updateProjectDescription: import('convex/server').RegisteredMutation<"public", {
    description?: string | undefined;
    projectId: import('convex/values').GenericId<"projects">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Toggle project public/private status
 */
export declare const toggleProjectPublicStatus: import('convex/server').RegisteredMutation<"public", {
    projectId: import('convex/values').GenericId<"projects">;
    isPublicViewOnly: boolean;
}, Promise<{
    success: boolean;
}>>;
/**
 * Delete a project and all associated data (cascading delete)
 */
export declare const deleteProject: import('convex/server').RegisteredMutation<"public", {
    projectId: import('convex/values').GenericId<"projects">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Create a new item (admin)
 */
export declare const createItem: import('convex/server').RegisteredMutation<"public", {
    description?: string | undefined;
    boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
    position?: number | undefined;
    title: string;
    projectId: import('convex/values').GenericId<"projects">;
    columnId: import('convex/values').GenericId<"projectColumns">;
}, Promise<import('convex/values').GenericId<"projectItems">>>;
/**
 * Update an item
 */
export declare const updateItem: import('convex/server').RegisteredMutation<"public", {
    title?: string | undefined;
    description?: string | undefined;
    itemId: import('convex/values').GenericId<"projectItems">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Delete an item
 */
export declare const deleteItem: import('convex/server').RegisteredMutation<"public", {
    itemId: import('convex/values').GenericId<"projectItems">;
}, Promise<{
    success: boolean;
}>>;
/**
 * Move an item to a different column
 */
export declare const moveItem: import('convex/server').RegisteredMutation<"public", {
    itemId: import('convex/values').GenericId<"projectItems">;
    targetColumnId: import('convex/values').GenericId<"projectColumns">;
    targetPosition: number;
}, Promise<{
    success: boolean;
}>>;
/**
 * Reorder an item within the same column
 */
export declare const reorderItem: import('convex/server').RegisteredMutation<"public", {
    itemId: import('convex/values').GenericId<"projectItems">;
    newPosition: number;
}, Promise<{
    success: boolean;
}>>;
/**
 * Save project customization
 */
export declare const saveCustomization: import('convex/server').RegisteredMutation<"public", {
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
}, Promise<{
    success: boolean;
}>>;
