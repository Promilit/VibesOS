# @uservibes/kanban-widget

An embeddable Kanban widget for collecting user feedback, feature requests, and roadmap voting.

## Installation

### NPM / Yarn / PNPM

```bash
npm install @uservibes/kanban-widget
# or
yarn add @uservibes/kanban-widget
# or
pnpm add @uservibes/kanban-widget
```

### CDN

```html
<script src="https://unpkg.com/@uservibes/kanban-widget/dist/uservibes-widget.umd.js"></script>
```

## Usage

### Web Component (Recommended)

The simplest way to use the widget is as a Web Component:

```html
<script src="https://unpkg.com/@uservibes/kanban-widget/dist/uservibes-widget.umd.js"></script>

<uservibes-kanban
  api-key="your-api-key"
  theme="light"
  convex-url="https://your-convex-url.convex.cloud"
  clerk-key="pk_your_clerk_key">
</uservibes-kanban>
```

### React / TypeScript

```tsx
import { useEffect, useRef } from 'react';
import { registerWidget } from '@uservibes/kanban-widget';

// Register the custom element once
registerWidget();

function FeedbackWidget() {
  return (
    <uservibes-kanban
      api-key="your-api-key"
      theme="light"
      convex-url="https://your-convex-url.convex.cloud"
      clerk-key="pk_your_clerk_key"
    />
  );
}
```

For TypeScript, add this to your global types:

```ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'uservibes-kanban': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'api-key': string;
          'convex-url'?: string;
          'clerk-key'?: string;
          theme?: 'light' | 'dark' | 'auto';
        },
        HTMLElement
      >;
    }
  }
}
```

### iframe Embed

For maximum isolation, use an iframe:

```html
<iframe
  src="https://your-app.com/embed?apiKey=your-api-key&theme=light"
  width="100%"
  height="800px"
  frameborder="0"
  allow="clipboard-write">
</iframe>
```

## Configuration

### Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `api-key` | Yes | Your UserVibes API key |
| `convex-url` | No | Convex deployment URL (defaults to production) |
| `clerk-key` | No | Clerk publishable key for authentication |
| `theme` | No | Color theme: `light`, `dark`, or `auto` (default: `light`) |

## Features

- **Voting**: Users can upvote/downvote feature requests
- **Submissions**: Authenticated users can submit new feature requests
- **Kanban Board**: Visual board with customizable columns
- **Theming**: Light/dark mode with customizable colors
- **Authentication**: Integrated with Clerk for secure user authentication
- **Real-time Updates**: Live updates via Convex real-time database

## Customization

Widget appearance can be customized through the UserVibes dashboard:
- Logo and company name
- Primary and secondary colors
- Background and card colors
- Font families and sizes
- Border radius and spacing
- Custom CSS

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## License

MIT
