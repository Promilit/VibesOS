/**
 * Admin mutations for kanban board management
 * These functions are only accessible to authenticated Clerk users (admins)
 */
/**
 * Initialize the 3 default boards with 4 columns each for a customer
 * Should be called once per customer when they first access kanban
 */
export declare const initializeBoards: any;
/**
 * Create a new kanban item (admin only)
 */
export declare const createItem: any;
/**
 * Update an existing kanban item (admin only)
 */
export declare const updateItem: any;
/**
 * Delete a kanban item (admin only)
 */
export declare const deleteItem: any;
/**
 * Move an item to a different column (drag-and-drop)
 */
export declare const moveItem: any;
/**
 * Reorder an item within the same column
 */
export declare const reorderItem: any;
/**
 * Save widget customization settings
 */
export declare const saveCustomization: any;
/**
 * Reset widget customization to defaults (deletes customization)
 */
export declare const resetCustomization: any;
