/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as apiKeys from "../apiKeys.js";
import type * as apiKeysActions from "../apiKeysActions.js";
import type * as http from "../http.js";
import type * as kanban_admin_mutations from "../kanban/admin/mutations.js";
import type * as kanban_admin_queries from "../kanban/admin/queries.js";
import type * as kanban_internal_mutations from "../kanban/internal/mutations.js";
import type * as kanban_internal_queries from "../kanban/internal/queries.js";
import type * as kanban_lib_auth from "../kanban/lib/auth.js";
import type * as kanban_lib_permissions from "../kanban/lib/permissions.js";
import type * as kanban_lib_positions from "../kanban/lib/positions.js";
import type * as kanban_widget_actions from "../kanban/widget/actions.js";
import type * as kanban_widget_queries from "../kanban/widget/queries.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  apiKeys: typeof apiKeys;
  apiKeysActions: typeof apiKeysActions;
  http: typeof http;
  "kanban/admin/mutations": typeof kanban_admin_mutations;
  "kanban/admin/queries": typeof kanban_admin_queries;
  "kanban/internal/mutations": typeof kanban_internal_mutations;
  "kanban/internal/queries": typeof kanban_internal_queries;
  "kanban/lib/auth": typeof kanban_lib_auth;
  "kanban/lib/permissions": typeof kanban_lib_permissions;
  "kanban/lib/positions": typeof kanban_lib_positions;
  "kanban/widget/actions": typeof kanban_widget_actions;
  "kanban/widget/queries": typeof kanban_widget_queries;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
