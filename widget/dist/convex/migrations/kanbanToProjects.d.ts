/**
 * Migration script: Kanban Boards → Projects
 *
 * This migration handles the transition from the old kanbanBoards structure
 * to the new projects structure with per-project customization.
 *
 * Changes:
 * 1. Adds commentCount: 0 to all existing projectItems
 * 2. Adds updatedAt: createdAt to all existing projects
 * 3. Creates projectCustomization records for each project (copying from widgetCustomization if exists)
 *
 * NOTE: Table renames are handled automatically by Convex schema evolution:
 * - kanbanBoards → projects
 * - kanbanColumns → projectColumns
 * - kanbanItems → projectItems
 * - kanbanVotes → projectVotes
 * - widgetCustomization → projectCustomization (structure change)
 */
export declare const migrateKanbanToProjects: import('convex/server').RegisteredMutation<"internal", import('convex/server').DefaultFunctionArgs, Promise<{
    projectsUpdated: number;
    itemsUpdated: number;
    customizationsCreated: number;
    errors: string[];
}>>;
/**
 * Rollback migration (if needed)
 *
 * WARNING: This will delete all projectCustomization records
 * Only use this if the migration needs to be re-run
 */
export declare const rollbackMigration: import('convex/server').RegisteredMutation<"internal", import('convex/server').DefaultFunctionArgs, Promise<{
    deleted: number;
}>>;
/**
 * Verify migration status
 *
 * Checks if the migration has been completed successfully
 */
export declare const verifyMigration: import('convex/server').RegisteredMutation<"internal", import('convex/server').DefaultFunctionArgs, Promise<{
    totalProjects: number;
    projectsWithUpdatedAt: number;
    totalItems: number;
    itemsWithCommentCount: number;
    totalCustomizations: number;
    projectsWithCustomization: number;
    projectsMissingCustomization: string[];
}>>;
