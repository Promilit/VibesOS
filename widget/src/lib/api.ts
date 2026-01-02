/**
 * UserVibes Widget API Client
 * Handles communication with the Convex backend via HTTP
 * Uses Clerk authentication for user actions
 */

import type { Clerk } from "@clerk/clerk-js";

// Types
export interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  allowUserSubmissions: boolean;
  columns?: Column[];
}

// Backward compatibility alias
export type Board = Project;

export interface Column {
  _id: string;
  name: string;
  slug: string;
  position: string;
  order: number;
}

export interface Item {
  _id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  voteCount: number;
  commentCount: number;
  createdBy: string;
  createdByType: "admin" | "widget_user";
  position: number;
  status: "backlog" | "in-progress" | "review" | "done";
  createdAt: number;
}

export interface Customization {
  logoUrl?: string;
  companyName?: string;
  widgetTitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  darkBackgroundColor?: string;
  darkCardBackgroundColor?: string;
  darkTextColor?: string;
  darkBorderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  headingFontFamily?: string;
  borderRadius?: string;
  spacing?: string;
  customCss?: string;
}

// Simple HTTP client for Convex
async function convexFetch(
  convexUrl: string,
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<unknown> {
  const url = `${convexUrl}/${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  const result = await response.json();

  // Convex returns { status: "success", value: ... } or { status: "error", errorMessage: ... }
  if (result.status === "error") {
    throw new Error(result.errorMessage || "Request failed");
  }

  return result.value;
}

// Hash API key client-side using Web Crypto API
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// API Client
export class WidgetApiClient {
  private convexUrl: string;
  private apiKey: string;
  private apiKeyHash: string | null = null;
  private clerk: Clerk | null = null;

  constructor(convexUrl: string, apiKey: string) {
    this.convexUrl = convexUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  setClerk(clerk: Clerk) {
    this.clerk = clerk;
  }

  private async getApiKeyHash(): Promise<string> {
    if (!this.apiKeyHash) {
      this.apiKeyHash = await hashString(this.apiKey);
    }
    return this.apiKeyHash;
  }

  private async getAuthToken(): Promise<string | undefined> {
    if (!this.clerk?.session) {
      return undefined;
    }
    try {
      const token = await this.clerk.session.getToken({ template: "convex" });
      return token || undefined;
    } catch {
      return undefined;
    }
  }

  private async action(
    functionName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const token = await this.getAuthToken();
    return convexFetch(
      this.convexUrl,
      "api/action",
      { path: functionName, args },
      token
    );
  }

  private async mutation(
    functionName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const token = await this.getAuthToken();
    return convexFetch(
      this.convexUrl,
      "api/mutation",
      { path: functionName, args },
      token
    );
  }

  // Check if user is authenticated via Clerk
  isAuthenticated(): boolean {
    return !!this.clerk?.user;
  }

  // Get current user info from Clerk
  getCurrentUser(): { id: string; email: string; displayName: string } | null {
    if (!this.clerk?.user) {
      return null;
    }
    const user = this.clerk.user;
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      displayName:
        user.fullName || user.firstName || user.username || "User",
    };
  }

  // Open Clerk sign-in modal
  async signIn(): Promise<void> {
    if (this.clerk) {
      await this.clerk.openSignIn({});
    }
  }

  // Open Clerk sign-up modal
  async signUp(): Promise<void> {
    if (this.clerk) {
      await this.clerk.openSignUp({});
    }
  }

  // Sign out via Clerk
  async signOut(): Promise<void> {
    if (this.clerk) {
      await this.clerk.signOut();
    }
  }

  // Data fetching methods (use actions with hashed API key for tracking)
  async getProjects(): Promise<Project[]> {
    const apiKeyHash = await this.getApiKeyHash();
    const projects = (await this.action("projects/widget/actions:getProjects", {
      apiKeyHash,
    })) as Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
      isPublicViewOnly: boolean;
      columns: Column[];
    }>;
    // Map to simpler format
    return projects.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      isPublic: !p.isPublicViewOnly,
      allowUserSubmissions: !p.isPublicViewOnly,
      columns: p.columns,
    }));
  }

  // Backward compatibility alias
  async getBoards(): Promise<Board[]> {
    return this.getProjects();
  }

  async getProjectWithColumns(
    projectId: string
  ): Promise<{ project: Project; columns: Column[] } | null> {
    const projects = await this.getProjects();
    const projectData = projects.find((p) => p._id === projectId);
    if (!projectData) return null;

    return {
      project: projectData,
      columns: projectData.columns || [],
    };
  }

  // Backward compatibility alias
  async getBoardWithColumns(
    boardId: string
  ): Promise<{ board: Board; columns: Column[] } | null> {
    const result = await this.getProjectWithColumns(boardId);
    if (!result) return null;
    return { board: result.project, columns: result.columns };
  }

  async getProjectItems(projectId: string): Promise<Item[]> {
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.action("projects/widget/actions:getItems", {
      apiKeyHash,
      projectId,
    })) as Item[];
  }

  // Backward compatibility alias
  async getBoardItems(boardId: string): Promise<Item[]> {
    return this.getProjectItems(boardId);
  }

  async getProjectCustomization(projectId: string): Promise<Customization | null> {
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.action("projects/widget/actions:getCustomization", {
      apiKeyHash,
      projectId,
    })) as Customization | null;
  }

  // Legacy method - returns customization for first project
  async getCustomization(): Promise<Customization | null> {
    const projects = await this.getProjects();
    if (projects.length === 0) return null;
    return this.getProjectCustomization(projects[0]._id);
  }

  // User actions (require Clerk authentication)
  async vote(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("projects/widget/mutations:vote", {
      apiKeyHash,
      itemId,
    })) as { success: boolean; error?: string };
  }

  async unvote(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("projects/widget/mutations:unvote", {
      apiKeyHash,
      itemId,
    })) as { success: boolean; error?: string };
  }

  async createItem(
    projectId: string,
    title: string,
    description?: string
  ): Promise<{ success: boolean; itemId?: string; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("projects/widget/mutations:createItem", {
      apiKeyHash,
      projectId,
      title,
      description,
    })) as { success: boolean; itemId?: string; error?: string };
  }

  async getUserVotes(projectId: string): Promise<string[]> {
    if (!this.isAuthenticated()) {
      return [];
    }
    const user = this.getCurrentUser();
    if (!user) {
      return [];
    }
    const apiKeyHash = await this.getApiKeyHash();
    try {
      return (await this.action("projects/widget/actions:getUserVotes", {
        apiKeyHash,
        clerkUserId: user.id,
        projectId,
      })) as string[];
    } catch {
      return [];
    }
  }
}

// Singleton instance manager
let clientInstance: WidgetApiClient | null = null;

export function initializeClient(
  convexUrl: string,
  apiKey: string
): WidgetApiClient {
  clientInstance = new WidgetApiClient(convexUrl, apiKey);
  return clientInstance;
}

export function getClient(): WidgetApiClient | null {
  return clientInstance;
}
