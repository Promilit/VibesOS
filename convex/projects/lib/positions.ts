// @ts-nocheck
/**
 * Calculate a new position for fractional indexing
 *
 * This allows for easy reordering without updating all items
 */
export function calculatePosition(
  beforePosition: number | undefined,
  afterPosition: number | undefined
): number {
  if (beforePosition === undefined && afterPosition === undefined) {
    return 1;
  }

  if (beforePosition === undefined) {
    return afterPosition! - 1;
  }

  if (afterPosition === undefined) {
    return beforePosition + 1;
  }

  return (beforePosition + afterPosition) / 2;
}

/**
 * Get the max position in a column
 */
export function getMaxPosition(positions: number[]): number {
  if (positions.length === 0) {
    return 0;
  }
  return Math.max(...positions);
}

/**
 * Generate a new position at the end of a list
 */
export function getNewEndPosition(existingPositions: number[]): number {
  return getMaxPosition(existingPositions) + 1;
}
