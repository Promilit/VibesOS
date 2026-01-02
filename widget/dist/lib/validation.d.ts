import { z } from 'zod';
/**
 * Email Schema
 * - Validates email format
 * - Converts to lowercase
 * - Trims whitespace
 * - Sanitizes XSS characters
 */
export declare const emailSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
/**
 * Safe Text Schema
 * - For short text inputs (names, titles, usernames, etc.)
 * - Max 100 characters
 * - Trims whitespace
 * - Sanitizes XSS characters
 */
export declare const safeTextSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Safe Long Text Schema
 * - For longer text inputs (descriptions, bios, comments, etc.)
 * - Max 5000 characters
 * - Trims whitespace
 * - Sanitizes XSS characters
 */
export declare const safeLongTextSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Optional Safe Text Schema
 * - Same as safeTextSchema but optional/nullable
 */
export declare const optionalSafeTextSchema: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
/**
 * Optional Safe Long Text Schema
 * - Same as safeLongTextSchema but optional/nullable
 */
export declare const optionalSafeLongTextSchema: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
/**
 * URL Schema
 * - Validates URL format
 * - Requires HTTPS for security
 */
export declare const urlSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Optional URL Schema
 */
export declare const optionalUrlSchema: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
/**
 * Username Schema
 * - Alphanumeric, hyphens, underscores only
 * - 3-30 characters
 */
export declare const usernameSchema: z.ZodString;
/**
 * Example Schemas for Common Use Cases
 * =====================================
 */
/**
 * User Profile Update Schema
 * Example for updating user profile information
 */
export declare const updateProfileSchema: z.ZodObject<{
    displayName: z.ZodEffects<z.ZodString, string, string>;
    bio: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    website: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    bio?: string | null | undefined;
    website?: string | null | undefined;
}, {
    displayName: string;
    bio?: string | null | undefined;
    website?: string | null | undefined;
}>;
/**
 * Contact Form Schema
 * Example for contact/support forms
 */
export declare const contactFormSchema: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
    email: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    subject: z.ZodEffects<z.ZodString, string, string>;
    message: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    name: string;
    message: string;
    email: string;
    subject: string;
}, {
    name: string;
    message: string;
    email: string;
    subject: string;
}>;
/**
 * Create Post Schema
 * Example for user-generated content
 */
export declare const createPostSchema: z.ZodObject<{
    title: z.ZodEffects<z.ZodString, string, string>;
    content: z.ZodEffects<z.ZodString, string, string>;
    tags: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    tags?: string[] | undefined;
}, {
    title: string;
    content: string;
    tags?: string[] | undefined;
}>;
/**
 * User Preferences Schema
 * Example for app settings/preferences
 */
export declare const userPreferencesSchema: z.ZodObject<{
    theme: z.ZodEnum<["light", "dark", "system"]>;
    emailNotifications: z.ZodBoolean;
    displayName: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
}, "strip", z.ZodTypeAny, {
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    displayName?: string | null | undefined;
}, {
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    displayName?: string | null | undefined;
}>;
