/**
 * Main Widget Component
 * Orchestrates all sub-components and manages rendering
 * Uses Clerk for authentication
 */

import { Clerk } from "@clerk/clerk-js";
import { createElement, clearElement } from "../lib/dom";
import { widgetStore, actions, WidgetState } from "../lib/state";
import { initializeClient, getClient, Customization } from "../lib/api";
import { renderHeader } from "./Header";
import { renderAuthForm } from "./AuthForm";
import { renderBoardList } from "./BoardList";
import { renderBoardView } from "./BoardView";
import widgetStyles from "../styles/widget.css?inline";

export interface WidgetConfig {
  apiKey: string;
  convexUrl?: string;
  clerkPublishableKey?: string;
  theme?: "light" | "dark" | "auto";
}

export class UserVibesWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private container: HTMLElement | null = null;
  private headerContainer: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private footerContainer: HTMLElement | null = null;
  private config: WidgetConfig | null = null;
  private unsubscribe: (() => void) | null = null;
  private customization: Customization | null = null;
  private clerk: Clerk | null = null;

  static get observedAttributes() {
    return ["api-key", "convex-url", "clerk-key", "theme"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.initialize();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.config) {
      this.initialize();
    }
  }

  private async initialize() {
    const apiKey = this.getAttribute("api-key");
    const convexUrl = this.getAttribute("convex-url") || this.getDefaultConvexUrl();
    const clerkPublishableKey = this.getAttribute("clerk-key") || "";
    const theme = (this.getAttribute("theme") as "light" | "dark" | "auto") || "light";

    if (!apiKey) {
      this.showError("Missing api-key attribute");
      return;
    }

    this.config = { apiKey, convexUrl, clerkPublishableKey, theme };

    // Initialize API client
    const client = initializeClient(convexUrl, apiKey);

    // Setup shadow DOM
    this.setupShadowDOM();

    // Subscribe to state changes
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.unsubscribe = widgetStore.subscribe((state) => this.render(state));

    // Initialize Clerk if key provided
    if (clerkPublishableKey) {
      await this.initializeClerk(clerkPublishableKey, client);
    } else {
      actions.setClerkLoaded(true);
    }

    // Load customization and initial data
    await this.loadInitialData();
  }

  private async initializeClerk(
    publishableKey: string,
    client: ReturnType<typeof getClient>
  ) {
    try {
      this.clerk = new Clerk(publishableKey);
      await this.clerk.load();

      // Pass Clerk to API client
      if (client) {
        client.setClerk(this.clerk);
      }

      // Update auth state based on Clerk user
      this.updateAuthFromClerk();

      // Listen for auth changes
      this.clerk.addListener((resources) => {
        if (resources.user) {
          const user = resources.user;
          actions.setAuthenticated({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            displayName: user.fullName || user.firstName || user.username || "User",
          });
        } else {
          actions.logout();
        }
      });

      actions.setClerkLoaded(true);
    } catch (error) {
      console.error("Failed to initialize Clerk:", error);
      actions.setClerkLoaded(true); // Continue without auth
    }
  }

  private updateAuthFromClerk() {
    if (!this.clerk) return;

    const user = this.clerk.user;
    if (user) {
      actions.setAuthenticated({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        displayName: user.fullName || user.firstName || user.username || "User",
      });
    }
  }

  private getDefaultConvexUrl(): string {
    // This should be configured at build time or via attribute
    // For production, use environment variable or CDN config
    return "https://YOUR_CONVEX_URL.convex.cloud";
  }

  private setupShadowDOM() {
    clearElement(this.shadow as any);

    // Add styles
    const style = document.createElement("style");
    style.textContent = widgetStyles;
    this.shadow.appendChild(style);

    // Create main container
    this.container = createElement("div", { className: "uv-widget" });
    if (this.config?.theme === "dark") {
      this.container.dataset.theme = "dark";
    } else if (this.config?.theme === "auto") {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        this.container.dataset.theme = "dark";
      }
    }

    // Create sections
    this.headerContainer = createElement("div", { className: "uv-header-wrapper" });
    this.contentContainer = createElement("div", { className: "uv-content-wrapper" });
    this.footerContainer = createElement("div", { className: "uv-footer-wrapper" });

    this.container.appendChild(this.headerContainer);
    this.container.appendChild(this.contentContainer);
    this.container.appendChild(this.footerContainer);

    this.shadow.appendChild(this.container);
  }

  private async loadInitialData() {
    const client = getClient();
    if (!client) return;

    actions.setLoading(true);

    try {
      // Load customization
      const customization = await client.getCustomization();
      this.customization = customization;
      actions.setCustomization(customization);

      // Apply customization styles
      this.applyCustomization(customization);

      // Load boards
      const boards = await client.getBoards();
      actions.setBoards(boards);

      actions.setLoading(false);
    } catch (error: any) {
      actions.setError(error.message || "Failed to load widget data");
      actions.setLoading(false);
    }
  }

  private applyCustomization(customization: Customization | null) {
    if (!this.container || !customization) return;

    const isDark = this.container.dataset.theme === "dark";

    // Apply CSS variables
    const styles: Record<string, string> = {};

    if (isDark) {
      if (customization.darkPrimaryColor) styles["--uv-primary"] = customization.darkPrimaryColor;
      if (customization.darkSecondaryColor) styles["--uv-secondary"] = customization.darkSecondaryColor;
      if (customization.darkBackgroundColor) styles["--uv-background"] = customization.darkBackgroundColor;
      if (customization.darkCardBackgroundColor) styles["--uv-card-background"] = customization.darkCardBackgroundColor;
      if (customization.darkTextColor) styles["--uv-text"] = customization.darkTextColor;
      if (customization.darkBorderColor) styles["--uv-border"] = customization.darkBorderColor;
    } else {
      if (customization.primaryColor) styles["--uv-primary"] = customization.primaryColor;
      if (customization.secondaryColor) styles["--uv-secondary"] = customization.secondaryColor;
      if (customization.backgroundColor) styles["--uv-background"] = customization.backgroundColor;
      if (customization.cardBackgroundColor) styles["--uv-card-background"] = customization.cardBackgroundColor;
      if (customization.textColor) styles["--uv-text"] = customization.textColor;
      if (customization.borderColor) styles["--uv-border"] = customization.borderColor;
    }

    if (customization.fontFamily) styles["--uv-font-family"] = customization.fontFamily;
    if (customization.fontSize) styles["--uv-font-size"] = customization.fontSize;
    if (customization.headingFontFamily) styles["--uv-heading-font-family"] = customization.headingFontFamily;
    if (customization.borderRadius) styles["--uv-border-radius"] = customization.borderRadius;
    if (customization.spacing) styles["--uv-spacing"] = customization.spacing;

    // Apply styles
    Object.entries(styles).forEach(([property, value]) => {
      this.container!.style.setProperty(property, value);
    });

    // Apply custom CSS
    if (customization.customCss) {
      const customStyle = document.createElement("style");
      customStyle.textContent = customization.customCss;
      this.shadow.appendChild(customStyle);
    }
  }

  private render(state: WidgetState) {
    if (!this.headerContainer || !this.contentContainer || !this.footerContainer) return;

    // Render header
    renderHeader(this.headerContainer, this.customization);

    // Render content based on current view
    if (state.isLoading) {
      clearElement(this.contentContainer);
      const loadingDiv = createElement("div", { className: "uv-loading" });
      const spinner = createElement("div", { className: "uv-spinner" });
      loadingDiv.appendChild(spinner);
      this.contentContainer.appendChild(loadingDiv);
    } else if (state.error) {
      clearElement(this.contentContainer);
      const errorDiv = createElement("div", { className: "uv-error" });
      errorDiv.style.padding = "24px";
      errorDiv.style.textAlign = "center";
      errorDiv.textContent = state.error;
      this.contentContainer.appendChild(errorDiv);
    } else {
      switch (state.currentView) {
        case "auth":
          renderAuthForm(this.contentContainer);
          break;
        case "boards":
          renderBoardList(this.contentContainer);
          break;
        case "board":
          renderBoardView(this.contentContainer);
          break;
      }
    }

    // Render footer
    this.renderFooter();
  }

  private renderFooter() {
    if (!this.footerContainer) return;
    clearElement(this.footerContainer);

    const companyName = this.customization?.companyName;
    if (companyName) {
      const footer = createElement("div", { className: "uv-footer" }, [
        `Powered by ${companyName}`,
      ]);
      this.footerContainer.appendChild(footer);
    }
  }

  private showError(message: string) {
    this.shadow.innerHTML = `
      <style>
        .uv-error-container {
          padding: 24px;
          text-align: center;
          color: #ef4444;
          font-family: system-ui, sans-serif;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
        }
      </style>
      <div class="uv-error-container">${message}</div>
    `;
  }
}

// Register the custom element
export function registerWidget() {
  if (!customElements.get("uservibes-kanban")) {
    customElements.define("uservibes-kanban", UserVibesWidget);
  }
}
