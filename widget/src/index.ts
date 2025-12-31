/**
 * UserVibes Kanban Widget
 * Main entry point for the embeddable widget
 *
 * Usage:
 * <script src="https://cdn.uservibes.com/widget/v1/uservibes-widget.umd.js"></script>
 * <uservibes-kanban api-key="your-api-key" theme="light"></uservibes-kanban>
 */

import { UserVibesWidget, registerWidget } from "./components/Widget";

// Export for programmatic use
export { UserVibesWidget };
export { WidgetApiClient, initializeClient, getClient } from "./lib/api";
export type { Board, Column, Item, Customization } from "./lib/api";
export { widgetStore, actions } from "./lib/state";
export type { WidgetState } from "./lib/state";

// Auto-register when loaded via script tag
if (typeof window !== "undefined") {
  registerWidget();
}

// Also export register function for manual registration
export { registerWidget };
