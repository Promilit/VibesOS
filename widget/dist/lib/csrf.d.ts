/**
 * Generates a CSRF token bound to a session ID using HMAC-SHA256
 * @param sessionId - The session ID to bind the token to
 * @returns The generated CSRF token (HMAC digest)
 */
export declare function generateCsrfToken(sessionId: string): Promise<string>;
/**
 * Validates a CSRF token against the stored token
 * @param sentToken - Token received from the client
 * @param storedToken - Token stored in the cookie
 * @returns True if tokens match, false otherwise
 */
export declare function validateCsrfToken(sentToken: string, storedToken: string): boolean;
/**
 * Generates a UUID for session identification
 * @returns A v4 UUID string
 */
export declare function generateUUID(): string;
