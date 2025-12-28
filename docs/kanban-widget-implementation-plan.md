# Embeddable Kanban Widget System - Implementation Plan

## Overview

Building a multi-tenant, embeddable Kanban widget with 3 boards (Feature Requests, Bug Reports, Internal Roadmap), dual authentication (admin via Clerk, end-users via custom auth), real-time updates, full customization (colors, branding, fonts), and multiple distribution methods (iframe, web component, NPM, CDN).

## User Requirements Summary

- **Single widget with 3 tabbed boards**: Feature Requests, Bug Reports, Internal Roadmap
- **Standard columns**: Backlog → In Progress → Review → Done
- **Permissions**:
  - End users: Add to Backlog, edit/delete own items, vote on others' items, view all boards (no drag)
  - Admins: Full CRUD, drag between columns, manage from dashboard
- **Authentication**: End users must create accounts (not Clerk - separate auth system)
- **Distribution**: iframe, web component, NPM package, CDN script
- **API Key Integration**: Uses existing API key system to scope data per customer
- **Customization**: Full widget customization (colors, branding, fonts) per customer
- **Demo View**: Dashboard includes full-screen demo of configured widget for testing

## Architecture Decisions

### 1. End-User Authentication Strategy

**Chosen Approach**: Custom JWT-based authentication with email/password

**Why**:
- Clerk is expensive for high-volume end-users
- Widget users don't need full account management
- Simpler integration for embedded contexts
- Can be extended later (OAuth, magic links)

**Implementation**:
- Store widget users in `widgetUsers` table (scoped by `apiKeyUserId`)
- Password hashing with bcrypt in Node.js action
- JWT tokens (7-day expiry) stored in `widgetSessions` table
- Email verification optional for MVP

### 2. Widget Distribution Strategy

**Primary Method**: Web Component (custom element) via CDN
**Secondary Methods**: iframe, NPM package, script tag

**Rationale**:
- Web component provides best balance of isolation and integration
- Shadow DOM prevents style conflicts
- Can be used directly in HTML without build step
- NPM package for React developers who want full control
- iframe for maximum isolation but limited flexibility

### 3. Real-time Updates

**Approach**: Convex built-in subscriptions with `useQuery`

**Benefits**:
- No additional WebSocket setup needed
- Automatic reconnection and caching
- Works seamlessly with widget and dashboard
- When admin moves items in dashboard, widget updates instantly

### 4. Widget Customization System

**Approach**: CSS variables + configurable branding stored in database

**Customizable Elements**:
- **Colors**: Primary, secondary, accent, background, text, borders
- **Branding**: Logo URL, company name, widget title
- **Typography**: Font family, sizes, weights
- **Spacing**: Padding, margins, border radius

**Implementation Strategy**:
1. Store customization settings in `widgetCustomization` table (one per customer)
2. Admin configures via dashboard UI with live preview
3. Widget fetches customization via API key on load
4. Apply customization using CSS custom properties (CSS variables)
5. Support light/dark theme modes
6. Provide sensible defaults if no customization set
7. **Demo view**: Full-screen modal in dashboard showing actual working widget with real data for testing

**Why CSS Variables**:
- Dynamic theming without rebuilding widget
- Works in Shadow DOM (web component)
- Lightweight and performant
- Easy to override for advanced users

## Database Schema

See full schema in plan including:
- `widgetUsers` - End user accounts
- `kanbanBoards` - 3 boards per customer
- `kanbanColumns` - 4 columns per board
- `kanbanItems` - Cards with voting, ownership
- `kanbanVotes` - Vote tracking
- `widgetSessions` - JWT session management
- **`widgetCustomization`** - Colors, branding, fonts, custom CSS

## Dashboard Features

### Kanban Management Dashboard
- Tabs for 3 boards
- Drag-and-drop with @dnd-kit
- Create/edit/delete items
- Initialize boards button
- **Widget embed instructions**: Card showing how to install via:
  - Web Component with HTML snippet
  - iframe with HTML snippet
  - NPM package with install command
  - Script tag with HTML snippet
  - Each method has copy button for easy copying

### Widget Customization Dashboard
- **Color pickers** for all properties (light & dark modes)
- **Branding controls**: Logo URL, company name, widget title
- **Typography settings**: Font family, sizes, heading fonts
- **Spacing controls**: Border radius, padding
- **Custom CSS editor**: For advanced customization
- **Live preview pane**: Shows miniature widget updating in real-time
- **Demo view button**: Opens full-screen modal with actual working widget for testing
  - Uses real API key and customer data
  - Functional authentication, item creation, voting
  - Light/dark theme toggle
  - Embed code at bottom with copy button
- Reset to defaults button
- Save with optimistic updates

## Widget Features

### For End Users
- View all 3 boards (Feature Requests, Bug Reports, Internal Roadmap)
- Register/login with email and password
- Add items to Backlog column only
- Edit and delete their own items
- Vote on other users' items (not their own)
- Real-time updates when admins make changes

### For Admins (Dashboard)
- Full CRUD on all items
- Drag items between any columns
- View vote counts and user information
- Manage boards and customization
- Test widget in demo view before deploying

## Distribution Methods

1. **Web Component** (Primary)
   ```html
   <script src="https://cdn.uservibes.com/widget/v1/uservibes-widget.umd.js"></script>
   <uservibes-kanban api-key="uvos_..." theme="light"></uservibes-kanban>
   ```

2. **iframe**
   ```html
   <iframe src="https://widget.uservibes.com/embed?apiKey=uvos_..."
           width="100%" height="800px"></iframe>
   ```

3. **NPM Package**
   ```bash
   npm install @uservibes/kanban-widget
   ```

4. **Script Tag**
   ```html
   <script src="https://cdn.uservibes.com/widget/v1/uservibes-widget.umd.js"></script>
   <script>
     UserVibes.init({ apiKey: 'uvos_...', container: '#widget' });
   </script>
   ```

## Security Highlights

- **API Key Validation**: SHA-256 hashing, verified on every request
- **Password Security**: bcrypt hashing with cost factor 12
- **Session Management**: JWT tokens with 7-day expiry, hashed before storage
- **Permission Enforcement**: User can only modify own items, vote on others'
- **XSS Prevention**: Input sanitization, React's built-in protection, CSP headers
- **Custom CSS Sanitization**: Strip dangerous properties and scripts
- **CORS Configuration**: Proper headers for cross-origin widget embedding
- **Rate Limiting**: Per API key and IP-based limits

## Implementation Timeline

- **Phase 1**: Database & Core Backend (3-4 days)
- **Phase 2**: Dashboard UI - Kanban (2-3 days)
- **Phase 3**: Dashboard UI - Customization (2-3 days)
- **Phase 4**: Widget Development (4-5 days)
- **Phase 5**: Distribution (2-3 days)
- **Phase 6**: Polish & Testing (1-2 days)

**Total**: ~15-20 days

## Success Criteria

1. ✅ Admin can initialize 3 boards from dashboard
2. ✅ Admin can drag items between columns
3. ✅ Widget can be embedded via web component
4. ✅ End users can register/login
5. ✅ End users can add items to Backlog only
6. ✅ End users can edit/delete only their own items
7. ✅ End users can vote on others' items
8. ✅ Real-time updates work (admin changes → widget updates)
9. ✅ Multiple customers' data is isolated
10. ✅ All permissions enforced correctly
11. ✅ Admin can customize widget colors (light & dark mode)
12. ✅ Admin can add logo and branding
13. ✅ Admin can customize fonts and spacing
14. ✅ Customization applies dynamically to widget
15. ✅ Live preview shows customization changes in real-time
16. ✅ Custom CSS can be added for advanced customization
17. ✅ **Demo view shows actual working widget for testing**

## Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database)
- **Auth**: Clerk (admin), Custom JWT (end users)
- **Drag-and-Drop**: @dnd-kit
- **Styling**: Tailwind CSS, CSS Variables
- **UI Components**: Radix UI, shadcn/ui
- **Build**: Vite (for widget package)
- **Distribution**: Vercel (hosting), NPM (package), CDN

## Notes

- **Real-time**: Convex handles WebSocket subscriptions automatically via `useQuery`
- **Multi-tenant**: All queries filtered by `apiKeyUserId` to isolate customers
- **Fractional Indexing**: For drag-and-drop ordering
- **Denormalization**: Store `voteCount` on items for performance
- **CSS Variables**: Dynamic theming without widget rebuild
- **Widget Bundle Size**: Target < 100KB gzipped
- **Color Validation**: Validate hex codes before saving
- **Default Fallbacks**: Widget uses defaults if customization fails to load

For detailed implementation specifications, see the full plan in `.claude/plans/`.
