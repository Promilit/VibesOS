/**
 * Admin queries for kanban board management
 * These functions are only accessible to authenticated Clerk users (admins)
 */
/**
 * Get all boards for the authenticated admin user
 */
export declare const getBoards: any;
/**
 * Get a single board with its columns
 */
export declare const getBoardWithColumns: any;
/**
 * Get all items for a specific board, grouped by column
 */
export declare const getBoardItems: any;
/**
 * Get a single item with its details and votes
 */
export declare const getItem: any;
/**
 * Get all items across all boards for the admin user
 */
export declare const getAllItems: any;
/**
 * Get customization settings for the admin user
 */
export declare const getCustomization: any;
/**
 * Check if boards have been initialized for the admin user
 */
export declare const areBoardsInitialized: any;
/**
 * Get statistics for the admin dashboard
 */
export declare const getStats: any;
