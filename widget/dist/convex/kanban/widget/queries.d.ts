/**
 * Get boards for an API key (public widget query)
 * This is called by the embedded widget with an API key
 */
export declare const getBoards: any;
/**
 * Get items for a board (optionally filtered by column)
 */
export declare const getItems: any;
/**
 * Get user's votes for a board
 * Returns array of item IDs the user has voted on
 * Uses Clerk authentication
 */
export declare const getUserVotes: any;
/**
 * Get customization for an API key
 * Returns customization settings or null (client uses defaults)
 */
export declare const getCustomization: any;
