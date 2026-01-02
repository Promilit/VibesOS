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
import type * as kanban_widget_mutations from "../kanban/widget/mutations.js";
import type * as kanban_widget_queries from "../kanban/widget/queries.js";
import type * as migrations_kanbanToProjects from "../migrations/kanbanToProjects.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as projects_admin_mutations from "../projects/admin/mutations.js";
import type * as projects_admin_queries from "../projects/admin/queries.js";
import type * as projects_analytics_queries from "../projects/analytics/queries.js";
import type * as projects_comments_mutations from "../projects/comments/mutations.js";
import type * as projects_comments_queries from "../projects/comments/queries.js";
import type * as projects_internal_mutations from "../projects/internal/mutations.js";
import type * as projects_lib_permissions from "../projects/lib/permissions.js";
import type * as projects_lib_positions from "../projects/lib/positions.js";
import type * as projects_widget_actions from "../projects/widget/actions.js";
import type * as projects_widget_mutations from "../projects/widget/mutations.js";
import type * as projects_widget_queries from "../projects/widget/queries.js";
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
  "kanban/widget/mutations": typeof kanban_widget_mutations;
  "kanban/widget/queries": typeof kanban_widget_queries;
  "migrations/kanbanToProjects": typeof migrations_kanbanToProjects;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  "projects/admin/mutations": typeof projects_admin_mutations;
  "projects/admin/queries": typeof projects_admin_queries;
  "projects/analytics/queries": typeof projects_analytics_queries;
  "projects/comments/mutations": typeof projects_comments_mutations;
  "projects/comments/queries": typeof projects_comments_queries;
  "projects/internal/mutations": typeof projects_internal_mutations;
  "projects/lib/permissions": typeof projects_lib_permissions;
  "projects/lib/positions": typeof projects_lib_positions;
  "projects/widget/actions": typeof projects_widget_actions;
  "projects/widget/mutations": typeof projects_widget_mutations;
  "projects/widget/queries": typeof projects_widget_queries;
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
