/**
 * Main Widget Component
 * Orchestrates all sub-components and manages rendering
 * Uses Clerk for authentication
 */
export interface WidgetConfig {
    apiKey: string;
    convexUrl?: string;
    clerkPublishableKey?: string;
    theme?: "light" | "dark" | "auto";
}
export declare class UserVibesWidget extends HTMLElement {
    private shadow;
    private container;
    private headerContainer;
    private contentContainer;
    private footerContainer;
    private config;
    private unsubscribe;
    private customization;
    private clerk;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(_name: string, oldValue: string, newValue: string): void;
    private initialize;
    private initializeClerk;
    private updateAuthFromClerk;
    private getDefaultConvexUrl;
    private setupShadowDOM;
    private loadInitialData;
    private applyCustomization;
    private render;
    private renderFooter;
    private showError;
}
export declare function registerWidget(): void;
