# Kanban to Projects Migration Guide

This guide walks through the migration from the old Kanban Boards structure to the new Projects architecture.

## Overview

The migration involves:
1. **Schema Changes**: Table renames and new fields
2. **Backend Reorganization**: New `/convex/projects/` structure
3. **Data Migration**: Converting existing data to new structure
4. **Dashboard UI Updates**: New project-based interface
5. **Widget Updates**: Per-project customization

## What's Changing

### Table Renames (Automatic)

Convex handles table renames automatically via schema evolution:

| Old Table Name | New Table Name | Changes |
|----------------|----------------|---------|
| `kanbanBoards` | `projects` | Removed `order` field, changed `apiKeyUserId` → `userId`, added `updatedAt` |
| `kanbanColumns` | `projectColumns` | Changed `boardId` → `projectId` |
| `kanbanItems` | `projectItems` | Changed `boardId` → `projectId`, added `commentCount` |
| `kanbanVotes` | `projectVotes` | Changed `boardId` → `projectId` |
| `widgetCustomization` | `projectCustomization` | **MAJOR**: Changed from per-user (`apiKeyUserId`) to per-project (`projectId`) |

### New Tables

- `projectComments`: Threaded comments on items
- `projectAnalytics`: Daily aggregated metrics per project

### New Features

- ✅ Dynamic project creation/deletion (no more fixed 3 boards)
- ✅ Per-project customization (colors, branding, etc.)
- ✅ Comments system with threading
- ✅ Analytics dashboard per project
- ✅ Fixed API key tracking (updates on ALL operations)
- ✅ One-to-one API key to project linking
- ✅ API keys page shows linked project info

## Migration Steps

### Phase 1: Backend Migration (COMPLETED ✓)

**Status**: Complete
- ✅ Schema updated at [convex/schema.ts](../convex/schema.ts)
- ✅ New backend structure at [convex/projects/](../convex/projects/)
- ✅ Migration script created at [convex/migrations/kanbanToProjects.ts](../convex/migrations/kanbanToProjects.ts)

### Phase 2: Run Data Migration

**Before you start:**
1. Backup your database (Convex dashboard → Settings → Export)
2. Test in development environment first

**Run the migration:**

```bash
# 1. Deploy the new schema (if not already deployed)
npx convex deploy

# 2. Verify current state
npx convex run migrations/kanbanToProjects:verifyMigration

# 3. Run the migration
npx convex run migrations/kanbanToProjects:migrateKanbanToProjects

# 4. Verify migration completed successfully
npx convex run migrations/kanbanToProjects:verifyMigration
```

**What the migration does:**

1. **Updates Projects**: Adds `updatedAt: createdAt` to all existing projects
2. **Updates Items**: Adds `commentCount: 0` to all existing items
3. **Creates Customizations**: For each project, creates a `projectCustomization` record
   - If user had a global `widgetCustomization`, copies it to ALL their projects
   - If no global customization exists, creates empty customization

**Migration is idempotent**: Safe to run multiple times - it only updates missing fields.

**Rollback** (if needed):
```bash
npx convex run migrations/kanbanToProjects:rollbackMigration
```

### Phase 3: Update Dashboard UI (IN PROGRESS)

**Status**: Partially complete

**Completed**:
- ✅ Create new `/app/dashboard/projects/` directory structure
- ✅ Project list page with create/delete functionality
- ✅ Project detail page with tabs: Board, Analytics, Settings
- ✅ API key selection in project creation (one API key per project)
- ✅ API keys page shows "Linked To" column with project name
- ✅ Create Project dialog filters out already-linked API keys

**Remaining Tasks**:
- [ ] Move kanban board components to Board tab
- [ ] Move widget customization to Settings tab
- [ ] Update navigation in sidebar
- [ ] Delete old `/app/dashboard/kanban/` directory

**File Changes**:
- ✅ Created: `app/dashboard/projects/page.tsx`
- ✅ Created: `app/dashboard/projects/[projectId]/page.tsx`
- Create: `app/dashboard/projects/[projectId]/components/board-tab.tsx`
- Create: `app/dashboard/projects/[projectId]/components/analytics-tab.tsx`
- Create: `app/dashboard/projects/[projectId]/components/settings-tab.tsx`
- Update: `app/dashboard/app-sidebar.tsx`
- Delete: `app/dashboard/kanban/*`
- Delete: `app/dashboard/widget-customization/*`

### Phase 4: Update Widget & Preview (COMPLETED ✓)

**Status**: Complete

**Widget Components**:
- ✅ Created `widget/src/lib/dom.ts` - DOM utilities
- ✅ Created `widget/src/components/BoardList.ts` - Board selection component
- ✅ Created `widget/src/components/BoardView.ts` - Kanban board display
- ✅ Widget builds successfully
- ✅ Updated widget API client to use new action endpoints
- ✅ Implemented per-project customization loading
- ✅ Added backward compatibility aliases (`getBoards()` → `getProjects()`)

**Widget Preview System**:
- ✅ Created `/app/widget-preview/page.tsx` - Full preview page
- ✅ Added iframe embedding support in middleware
- ✅ Preview applies ALL customization settings:
  - **Colors**: Primary, secondary, background, card background, text, border (light & dark modes)
  - **Branding**: Logo URL, company name, widget title
  - **Typography**: Font family, heading font family, font size
  - **Layout**: Border radius, spacing
  - **Advanced**: Custom CSS injection
- ✅ Preview modal in embed-section.tsx (95vw x 95vh, nearly full screen)

**Key Implementation Details**:

1. **Middleware Update** (`middleware.ts`):
   - Added `/widget-preview(.*)` to `isEmbedRoute` matcher
   - This allows the preview to be loaded in iframes (removes X-Frame-Options: DENY)

2. **Widget Preview Page** (`app/widget-preview/page.tsx`):
   - Fetches project boards via `api.projects.admin.queries.getProjectBoards`
   - Fetches customization via `api.projects.admin.queries.getCustomization`
   - Computes styles from customization with sensible defaults
   - Supports `?theme=dark` query param for dark mode preview
   - Shows branding header when logo/company name/widget title are set
   - Grid layout adapts to number of columns (max 4)
   - Custom CSS is injected via `<style>` tag

3. **Preview Dialog** (`embed-section.tsx`):
   - Uses shadcn Dialog component
   - Nearly full screen: `max-w-[95vw] w-[95vw] h-[95vh]`
   - Loads preview via iframe: `/widget-preview?projectId=${projectId}`

**File Changes**:
- ✅ Created: `widget/src/lib/dom.ts`
- ✅ Created: `widget/src/components/BoardList.ts`
- ✅ Created: `widget/src/components/BoardView.ts`
- ✅ Updated: `widget/src/lib/api.ts`
- ✅ Updated: `middleware.ts` - Added widget-preview to embed routes
- ✅ Created: `app/widget-preview/page.tsx` - Full customization preview
- ✅ Updated: `app/dashboard/projects/[projectId]/components/embed-section.tsx` - Preview dialog

### Phase 5: Add Comments System (PENDING)

**Status**: Not started

**Backend**:
- Create: `convex/projects/comments/queries.ts`
- Create: `convex/projects/comments/mutations.ts`

**Frontend**:
- Create: `app/dashboard/projects/[projectId]/components/comments-section.tsx`
- Create: `app/dashboard/projects/[projectId]/components/comment-item.tsx`

### Phase 6: Add Analytics (PENDING)

**Status**: Not started

**Backend**:
- Create: `convex/projects/analytics/queries.ts`

**Frontend**:
- Implement: Analytics tab with charts (recharts)
- Show: Vote trends, status breakdown, metrics, user insights

### Phase 7: Testing & Cleanup

**Status**: Not started

**Tasks**:
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security review
- [ ] Delete old `/convex/kanban/` directory
- [ ] Delete old `widgetCustomization` table (optional, after verification)
- [ ] Update all documentation

## API Changes

### For Widget Developers

**Old API** (deprecated):
```typescript
// Queries
api.kanban.widget.queries.getBoards({ apiKeyHash })
api.kanban.widget.queries.getItems({ apiKeyHash, boardId })
api.kanban.widget.queries.getCustomization({ apiKeyHash }) // Global

// Mutations
api.kanban.widget.mutations.vote({ apiKeyHash, clerkUserId, itemId })
```

**New API** (current):
```typescript
// Actions (tracks API key usage)
api.projects.widget.actions.getProjects({ apiKeyHash })
api.projects.widget.actions.getItems({ apiKeyHash, projectId })
api.projects.widget.actions.getCustomization({ apiKeyHash, projectId }) // Per-project

// Mutations (unchanged)
api.projects.widget.mutations.vote({ apiKeyHash, clerkUserId, itemId })
```

### For Dashboard

**Old API** (deprecated):
```typescript
api.kanban.admin.queries.getBoards()
api.kanban.admin.mutations.createBoard({ name })
```

**New API** (current):
```typescript
api.projects.admin.queries.getProjects()
api.projects.admin.mutations.createProject({ name, description, isPublicViewOnly })
api.projects.admin.mutations.renameProject({ projectId, name })
api.projects.admin.mutations.deleteProject({ projectId })
api.projects.admin.mutations.saveCustomization({ projectId, ...customization })
```

## Breaking Changes

### 1. API Keys Are Now Linked to Projects (One-to-One)

**Before**: API keys were independent, any key could access any board

**After**: Each project requires a dedicated API key, and each API key can only be linked to one project

**Dashboard Changes**:
- Create Project dialog requires selecting an API key
- API keys already linked to a project are hidden from the dropdown
- API keys page shows "Linked To" column with project name
- Warning shown when all API keys are already in use

**Backend Changes**:
- `projects` table has `apiKeyId` field linking to the API key
- `getUserApiKeys` query returns `linkedProject` field with project name
- Widget uses the linked API key to access project data

**Why this change**: Ensures clear ownership and prevents accidental data exposure across projects.

### 2. Customization is Now Per-Project

**Before**: One global customization per user (shared across all boards)
```typescript
// Old: Global customization
api.kanban.widget.queries.getCustomization({ apiKeyHash })
```

**After**: Each project has its own customization
```typescript
// New: Per-project customization
api.projects.widget.actions.getCustomization({ apiKeyHash, projectId })
```

**Migration handles this**: Copies global customization to all user projects.

### 3. Widget Must Track Current Project

**Before**: Widget showed 3 fixed boards

**After**: Widget shows all projects, user can switch between them

**Widget must**:
- Fetch customization for selected project
- Apply project-specific styling when switching

### 4. API Key Tracking Now Works on Queries

**Before**: `lastUsed` only updated on mutations

**After**: `lastUsed` updates on ALL operations (queries + mutations)

**Implementation**: Queries wrapped in actions that call `trackApiKeyUsage` mutation

## Verification Checklist

After migration, verify:

- [ ] All projects have `updatedAt` field
- [ ] All items have `commentCount: 0`
- [ ] Each project has a `projectCustomization` record
- [ ] Old kanban mutations still work (for backwards compatibility during transition)
- [ ] New project mutations work
- [ ] Widget can fetch projects
- [ ] Widget can fetch per-project customization
- [ ] API key `lastUsed` updates on queries
- [ ] No data loss

## Troubleshooting

### Migration fails with "Table not found"

**Cause**: Schema not deployed yet

**Solution**:
```bash
npx convex deploy
```

### Some projects missing customization

**Cause**: Migration was interrupted

**Solution**: Re-run migration (it's idempotent)
```bash
npx convex run migrations/kanbanToProjects:migrateKanbanToProjects
```

### Widget shows old structure

**Cause**: Widget not updated yet

**Solution**: Update widget to use new API (Phase 4)

### API key still shows "never used"

**Cause**: Widget still using old query endpoints

**Solution**: Widget must use new action endpoints:
- `api.projects.widget.actions.getProjects`
- `api.projects.widget.actions.getItems`
- etc.

## Timeline

- **Phase 1**: Backend Migration - ✅ COMPLETE
- **Phase 2**: Data Migration - ⏳ READY TO RUN
- **Phase 3**: Dashboard UI - 🔄 IN PROGRESS (API key linking complete)
- **Phase 4**: Widget & Preview - ✅ COMPLETE (widget components + preview system)
- **Phase 5**: Comments - 📅 Upcoming
- **Phase 6**: Analytics - 📅 Upcoming
- **Phase 7**: Testing & Cleanup - 📅 Final

## Support

Questions? Check:
- [Implementation Plan](../../../.claude/plans/lexical-bubbling-hollerith.md)
- [Schema](../convex/schema.ts)
- [Migration Script](../convex/migrations/kanbanToProjects.ts)
