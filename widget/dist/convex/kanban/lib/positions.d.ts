/**
 * Position calculation helpers for drag-and-drop ordering
 * Uses fractional indexing to allow items to be inserted between existing items
 */
/**
 * Calculate a new position between two existing positions
 * If before is null, insert at beginning (position - 1000)
 * If after is null, insert at end (position + 1000)
 */
export declare function calculatePosition(before: number | null, after: number | null): number;
/**
 * Calculate position at the end of a list
 */
export declare function calculatePositionAtEnd(maxPosition: number | null): number;
/**
 * Calculate position at the beginning of a list
 */
export declare function calculatePositionAtBeginning(minPosition: number | null): number;
/**
 * Check if positions need rebalancing
 * Returns true if items are too close together (difference < 0.1)
 */
export declare function needsRebalancing(positions: number[]): boolean;
/**
 * Rebalance positions to be evenly spaced
 * Returns new positions for all items
 */
export declare function rebalancePositions(count: number): number[];
