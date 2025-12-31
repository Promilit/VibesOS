/**
 * Simple reactive state management for the widget
 * No external dependencies - vanilla TypeScript
 */
export type Listener<T> = (value: T) => void;
export declare class Store<T> {
    private value;
    private listeners;
    constructor(initialValue: T);
    get(): T;
    set(newValue: T): void;
    update(updater: (current: T) => T): void;
    subscribe(listener: Listener<T>): () => void;
}
export interface WidgetState {
    isAuthenticated: boolean;
    user: {
        id: string;
        email: string;
        displayName: string;
    } | null;
    clerkLoaded: boolean;
    currentView: "auth" | "boards" | "board";
    selectedBoardId: string | null;
    isLoading: boolean;
    error: string | null;
    boards: any[];
    currentBoard: any | null;
    columns: any[];
    items: any[];
    userVotes: Set<string>;
    customization: any | null;
}
export declare const widgetStore: Store<WidgetState>;
export declare const actions: {
    setLoading(loading: boolean): void;
    setError(error: string | null): void;
    setClerkLoaded(loaded: boolean): void;
    setAuthenticated(user: {
        id: string;
        email: string;
        displayName: string;
    }): void;
    logout(): void;
    setBoards(boards: any[]): void;
    selectBoard(boardId: string, board: any, columns: any[], items: any[]): void;
    goToBoards(): void;
    setItems(items: any[]): void;
    setUserVotes(votes: string[]): void;
    toggleVote(itemId: string, hasVoted: boolean): void;
    addItem(item: any): void;
    setCustomization(customization: any): void;
    showAuth(): void;
};
