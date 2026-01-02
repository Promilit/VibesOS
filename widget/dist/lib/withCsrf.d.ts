import { NextRequest, NextResponse } from 'next/server';
/**
 * Higher-order function that wraps API route handlers with CSRF protection
 * Validates the CSRF token from the request header against the stored cookie
 * Tokens are single-use and cleared after validation
 *
 * @param handler - The API route handler to wrap
 * @returns A wrapped handler with CSRF protection
 *
 * @example
 * ```typescript
 * import { withCsrf } from '@/lib/withCsrf';
 *
 * async function loginHandler(request: NextRequest) {
 *   // Your login logic here
 *   return NextResponse.json({ success: true });
 * }
 *
 * export const POST = withCsrf(loginHandler);
 * ```
 */
export declare function withCsrf(handler: (request: NextRequest) => Promise<NextResponse>): (request: NextRequest) => Promise<NextResponse<unknown>>;
