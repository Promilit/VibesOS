import { NextRequest, NextResponse } from 'next/server';
/**
 * GET /api/csrf
 *
 * Generates a CSRF token for the current session or creates a temporary session.
 * The token is bound to the session ID and stored in an HTTP-only, SameSite=Strict cookie.
 *
 * @returns JSON response with the CSRF token
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/csrf', { credentials: 'include' });
 * const { csrfToken } = await response.json();
 * // Use csrfToken in subsequent POST requests via X-CSRF-Token header
 * ```
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    csrfToken: string;
}> | NextResponse<{
    error: string;
}>>;
export declare const config: {
    runtime: string;
};
