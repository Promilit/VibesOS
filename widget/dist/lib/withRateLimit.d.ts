import { NextRequest, NextResponse } from 'next/server';
/**
 * Higher-order function that wraps API route handlers with rate limiting
 * Tracks requests by IP address and returns 429 when limit is exceeded
 *
 * @param handler - The API route handler to wrap
 * @returns A wrapped handler with rate limiting protection
 *
 * @example
 * ```typescript
 * import { withRateLimit } from '@/lib/withRateLimit';
 * import { withCsrf } from '@/lib/withCsrf';
 *
 * async function sensitiveHandler(request: NextRequest) {
 *   // Your API logic here
 *   return NextResponse.json({ success: true });
 * }
 *
 * // Apply both rate limiting and CSRF protection
 * export const POST = withRateLimit(withCsrf(sensitiveHandler));
 * ```
 */
export declare function withRateLimit(handler: (request: NextRequest) => Promise<NextResponse>): (request: NextRequest) => Promise<NextResponse<unknown>>;
