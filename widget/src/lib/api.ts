/**
 * UserVibes Widget API Client
 * Handles communication with the Convex backend via HTTP
 * Uses Clerk authentication for user actions
 */

import type { Clerk } from "@clerk/clerk-js";

// Types
export interface Board {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  allowUserSubmissions: boolean;
  columns?: Column[];
}

export interface Column {
  _id: string;
  name: string;
  slug: string;
  position: string;
  order: number;
}

export interface Item {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  voteCount: number;
  createdBy: string;
  createdByType: "admin" | "widget_user";
  position: number;
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

  private async query(
    functionName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const token = await this.getAuthToken();
    return convexFetch(
      this.convexUrl,
      "api/query",
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

  // Data fetching methods (use queries with hashed API key)
  async getBoards(): Promise<Board[]> {
    const apiKeyHash = await this.getApiKeyHash();
    const boards = (await this.query("kanban/widget/queries:getBoards", {
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
    return boards.map((b) => ({
      _id: b._id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      isPublic: !b.isPublicViewOnly,
      allowUserSubmissions: !b.isPublicViewOnly,
      columns: b.columns,
    }));
  }

  async getBoardWithColumns(
    boardId: string
  ): Promise<{ board: Board; columns: Column[] } | null> {
    const boards = await this.getBoards();
    const boardData = boards.find((b) => b._id === boardId);
    if (!boardData) return null;

    return {
      board: boardData,
      columns: boardData.columns || [],
    };
  }

  async getBoardItems(boardId: string): Promise<Item[]> {
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.query("kanban/widget/queries:getItems", {
      apiKeyHash,
      boardId,
    })) as Item[];
  }

  async getCustomization(): Promise<Customization | null> {
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.query("kanban/widget/queries:getCustomization", {
      apiKeyHash,
    })) as Customization | null;
  }

  // User actions (require Clerk authentication)
  async vote(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("kanban/widget/mutations:vote", {
      apiKeyHash,
      itemId,
    })) as { success: boolean; error?: string };
  }

  async unvote(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("kanban/widget/mutations:unvote", {
      apiKeyHash,
      itemId,
    })) as { success: boolean; error?: string };
  }

  async createItem(
    boardId: string,
    title: string,
    description?: string
  ): Promise<{ success: boolean; itemId?: string; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }
    const apiKeyHash = await this.getApiKeyHash();
    return (await this.mutation("kanban/widget/mutations:createItem", {
      apiKeyHash,
      boardId,
      title,
      description,
    })) as { success: boolean; itemId?: string; error?: string };
  }

  async getUserVotes(boardId: string): Promise<string[]> {
    if (!this.isAuthenticated()) {
      return [];
    }
    const apiKeyHash = await this.getApiKeyHash();
    try {
      return (await this.query("kanban/widget/queries:getUserVotes", {
        apiKeyHash,
        boardId,
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
