/**
 * Create a new API key for the authenticated user (Node.js action)
 * This action generates the key using crypto and then calls a mutation to store it
 */
export declare const createApiKey: any;
/**
 * Verify an API key (Node.js action)
 * This action hashes the key and then calls a query to verify it
 */
export declare const verifyApiKey: any;
