/**
 * Calculate a new position for fractional indexing
 *
 * This allows for easy reordering without updating all items
 */
export declare function calculatePosition(beforePosition: number | undefined, afterPosition: number | undefined): number;
/**
 * Get the max position in a column
 */
export declare function getMaxPosition(positions: number[]): number;
/**
 * Generate a new position at the end of a list
 */
export declare function getNewEndPosition(existingPositions: number[]): number;
