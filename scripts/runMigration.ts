/**
 * Migration Runner Script
 *
 * This script runs the Kanban → Projects migration
 *
 * Usage:
 *   npx convex run migrations/kanbanToProjects:migrateKanbanToProjects
 *   npx convex run migrations/kanbanToProjects:verifyMigration
 *   npx convex run migrations/kanbanToProjects:rollbackMigration (if needed)
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Kanban → Projects Migration Script                ║
╚══════════════════════════════════════════════════════════════╝

To run the migration:
  npx convex run migrations/kanbanToProjects:migrateKanbanToProjects

To verify migration status:
  npx convex run migrations/kanbanToProjects:verifyMigration

To rollback (if needed):
  npx convex run migrations/kanbanToProjects:rollbackMigration

IMPORTANT:
- Backup your database before running the migration
- The migration is safe to run multiple times (idempotent)
- Table renames are handled automatically by Convex
`);

export {};
