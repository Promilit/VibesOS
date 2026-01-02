import { NextResponse } from 'next/server';
/**
 * Secure Error Handler
 * =====================
 *
 * Prevents information leakage through error messages:
 * - Development: Full error details + stack traces for debugging
 * - Production: Generic error messages, no internal details
 *
 * Security Benefits:
 * - Prevents exposure of internal paths, dependencies, database structure
 * - Hides stack traces that could reveal vulnerabilities
 * - Logs all errors server-side for monitoring
 *
 * @param error - The error to handle
 * @param context - Optional context (e.g., route name) for logging
 * @returns NextResponse with appropriate error message
 *
 * @example
 * ```typescript
 * async function handler(request: NextRequest) {
 *   try {
 *     // Your API logic here
 *     const result = await riskyOperation();
 *     return NextResponse.json({ success: true, result });
 *   } catch (error) {
 *     return handleApiError(error, 'my-api-route');
 *   }
 * }
 * ```
 */
export declare function handleApiError(error: unknown, context?: string): NextResponse;
/**
 * Handle validation errors with proper status codes
 *
 * @param message - Error message to return
 * @param details - Optional validation error details
 * @returns NextResponse with 400 status
 *
 * @example
 * ```typescript
 * if (!isValid) {
 *   return handleValidationError('Invalid input', { email: 'Email is required' });
 * }
 * ```
 */
export declare function handleValidationError(message: string, details?: Record<string, any>): NextResponse;
/**
 * Handle authorization errors
 *
 * @param message - Optional custom message
 * @returns NextResponse with 403 status
 */
export declare function handleForbiddenError(message?: string): NextResponse;
/**
 * Handle authentication errors
 *
 * @param message - Optional custom message
 * @returns NextResponse with 401 status
 */
export declare function handleUnauthorizedError(message?: string): NextResponse;
/**
 * Handle not found errors
 *
 * @param resource - The resource that wasn't found (e.g., 'User', 'Post')
 * @returns NextResponse with 404 status
 */
export declare function handleNotFoundError(resource?: string): NextResponse;
