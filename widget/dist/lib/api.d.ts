import { Clerk } from '@clerk/clerk-js';
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
export declare class WidgetApiClient {
    private convexUrl;
    private apiKey;
    private apiKeyHash;
    private clerk;
    constructor(convexUrl: string, apiKey: string);
    setClerk(clerk: Clerk): void;
    private getApiKeyHash;
    private getAuthToken;
    private query;
    private mutation;
    isAuthenticated(): boolean;
    getCurrentUser(): {
        id: string;
        email: string;
        displayName: string;
    } | null;
    signIn(): Promise<void>;
    signUp(): Promise<void>;
    signOut(): Promise<void>;
    getBoards(): Promise<Board[]>;
    getBoardWithColumns(boardId: string): Promise<{
        board: Board;
        columns: Column[];
    } | null>;
    getBoardItems(boardId: string): Promise<Item[]>;
    getCustomization(): Promise<Customization | null>;
    vote(itemId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    unvote(itemId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    createItem(boardId: string, title: string, description?: string): Promise<{
        success: boolean;
        itemId?: string;
        error?: string;
    }>;
    getUserVotes(boardId: string): Promise<string[]>;
}
export declare function initializeClient(convexUrl: string, apiKey: string): WidgetApiClient;
export declare function getClient(): WidgetApiClient | null;
