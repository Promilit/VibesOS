import { QueryCtx } from './_generated/server';
import { UserJSON } from '@clerk/backend';
export declare const current: import('convex/server').RegisteredQuery<"public", {}, Promise<{
    _id: import('convex/values').GenericId<"users">;
    _creationTime: number;
    name: string;
    externalId: string;
} | null>>;
export declare const upsertFromClerk: import('convex/server').RegisteredMutation<"internal", {
    data: UserJSON;
}, Promise<void>>;
export declare const deleteFromClerk: import('convex/server').RegisteredMutation<"internal", {
    clerkUserId: string;
}, Promise<void>>;
export declare function getCurrentUserOrThrow(ctx: QueryCtx): Promise<{
    _id: import('convex/values').GenericId<"users">;
    _creationTime: number;
    name: string;
    externalId: string;
}>;
export declare function getCurrentUser(ctx: QueryCtx): Promise<{
    _id: import('convex/values').GenericId<"users">;
    _creationTime: number;
    name: string;
    externalId: string;
} | null>;
