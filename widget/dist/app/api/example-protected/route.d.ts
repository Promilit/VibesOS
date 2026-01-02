import { NextRequest, NextResponse } from 'next/server';
/**
 * Apply security layers:
 * 1. withRateLimit - Prevents brute force (5 req/min per IP)
 * 2. withCsrf - Validates CSRF token from header
 * 3. Handler validates & sanitizes input with Zod
 *
 * Order matters: Rate limit first, then CSRF, then handler
 */
export declare const POST: (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare const config: {
    runtime: string;
};
