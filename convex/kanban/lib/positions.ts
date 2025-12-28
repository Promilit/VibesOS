/**
 * Position calculation helpers for drag-and-drop ordering
 * Uses fractional indexing to allow items to be inserted between existing items
 */

/**
 * Calculate a new position between two existing positions
 * If before is null, insert at beginning (position - 1000)
 * If after is null, insert at end (position + 1000)
 */
export function calculatePosition(before: number | null, after: number | null): number {
  if (before === null && after === null) {
    // First item
    return 1000;
  }

  if (before === null) {
    // Insert at beginning
    return after! - 1000;
  }

  if (after === null) {
    // Insert at end
    return before + 1000;
  }

  // Insert between two items
  return (before + after) / 2;
}

/**
 * Calculate position at the end of a list
 */
export function calculatePositionAtEnd(maxPosition: number | null): number {
  if (maxPosition === null) {
    return 1000; // First item
  }
  return maxPosition + 1000;
}

/**
 * Calculate position at the beginning of a list
 */
export function calculatePositionAtBeginning(minPosition: number | null): number {
  if (minPosition === null) {
    return 1000; // First item
  }
  return minPosition - 1000;
}

/**
 * Check if positions need rebalancing
 * Returns true if items are too close together (difference < 0.1)
 */
export function needsRebalancing(positions: number[]): boolean {
  for (let i = 0; i < positions.length - 1; i++) {
    if (Math.abs(positions[i + 1] - positions[i]) < 0.1) {
      return true;
    }
  }
  return false;
}

/**
 * Rebalance positions to be evenly spaced
 * Returns new positions for all items
 */
export function rebalancePositions(count: number): number[] {
  const positions: number[] = [];
  const step = 1000;

  for (let i = 0; i < count; i++) {
    positions.push((i + 1) * step);
  }

  return positions;
}
