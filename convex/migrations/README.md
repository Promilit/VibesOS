# Database Migrations

This directory contains database migration scripts for the UserVibes application.

## Available Migrations

### Kanban to Projects Migration

**File**: `kanbanToProjects.ts`

**Purpose**: Migrates from the old fixed 3-board Kanban structure to a dynamic project-based architecture.

**What it does**:
1. Adds `updatedAt` field to all existing projects
2. Adds `commentCount: 0` to all existing items
3. Creates per-project customization records (copies from global `widgetCustomization` if exists)

**How to run**:

```bash
# 1. Verify current migration status
npx convex run migrations/kanbanToProjects:verifyMigration

# 2. Run the migration
npx convex run migrations/kanbanToProjects:migrateKanbanToProjects

# 3. Verify it completed successfully
npx convex run migrations/kanbanToProjects:verifyMigration
```

**Rollback** (if needed):
```bash
npx convex run migrations/kanbanToProjects:rollbackMigration
```

**Safety**:
- ✅ Idempotent (safe to run multiple times)
- ✅ Only updates missing fields
- ✅ Does not delete any existing data
- ✅ Handles missing old tables gracefully

## Migration Best Practices

1. **Always backup** before running migrations:
   - Convex Dashboard → Settings → Export

2. **Test in development first**:
   - Run migration in dev environment
   - Verify results
   - Then run in production

3. **Verify before and after**:
   - Use `verifyMigration` to check status
   - Ensure all records were updated

4. **Monitor for errors**:
   - Check migration output for errors
   - Review error logs if migration fails

## Creating New Migrations

When creating new migrations:

1. Use `internalMutation` for migration functions
2. Make migrations idempotent (safe to re-run)
3. Include a `verify` function to check status
4. Include a `rollback` function if possible
5. Log progress and errors clearly
6. Handle missing tables/fields gracefully with try-catch

Example template:

```typescript
import { internalMutation } from "../_generated/server";

export const myMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration...");

    const results = {
      updated: 0,
      errors: [] as string[],
    };

    try {
      // Migration logic here
      const records = await ctx.db.query("myTable").collect();

      for (const record of records) {
        if (!record.newField) {
          await ctx.db.patch(record._id, {
            newField: defaultValue,
          });
          results.updated++;
        }
      }

      console.log(`Migration complete: ${results.updated} records updated`);
      return results;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.errors.push(msg);
      console.error("Migration failed:", msg);
      throw error;
    }
  },
});

export const verifyMyMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const total = await ctx.db.query("myTable").collect();
    const withNewField = total.filter(r => r.newField !== undefined);

    console.log(`Status: ${withNewField.length}/${total.length} records migrated`);

    return {
      total: total.length,
      migrated: withNewField.length,
      complete: withNewField.length === total.length,
    };
  },
});
```

## Troubleshooting

### "Function not found"

Make sure the migration is deployed:
```bash
npx convex deploy
```

### "Table not found"

Deploy the schema changes first:
```bash
npx convex deploy
```

### Migration runs but doesn't update records

Check if the migration is truly idempotent and not skipping records due to existing fields.

### Need to re-run migration

Most migrations are idempotent and safe to re-run. Check the specific migration's documentation.
