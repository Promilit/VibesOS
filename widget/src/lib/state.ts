/**
 * Simple reactive state management for the widget
 * No external dependencies - vanilla TypeScript
 */

export type Listener<T> = (value: T) => void;

export class Store<T> {
  private value: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
    this.listeners.forEach((listener) => listener(this.value));
  }

  update(updater: (current: T) => T) {
    this.set(updater(this.value));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    // Immediately call with current value
    listener(this.value);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }
}

// Widget State Types
export interface WidgetState {
  // Auth (Clerk-based)
  isAuthenticated: boolean;
  user: { id: string; email: string; displayName: string } | null;
  clerkLoaded: boolean;

  // UI State
  currentView: "auth" | "boards" | "board";
  selectedBoardId: string | null;
  isLoading: boolean;
  error: string | null;

  // Data
  boards: any[];
  currentBoard: any | null;
  columns: any[];
  items: any[];
  userVotes: Set<string>;
  customization: any | null;
}

// Initial state
const initialState: WidgetState = {
  isAuthenticated: false,
  user: null,
  clerkLoaded: false,
  currentView: "boards",
  selectedBoardId: null,
  isLoading: true,
  error: null,
  boards: [],
  currentBoard: null,
  columns: [],
  items: [],
  userVotes: new Set(),
  customization: null,
};

// Create the global store
export const widgetStore = new Store<WidgetState>(initialState);

// Helper actions
export const actions = {
  setLoading(loading: boolean) {
    widgetStore.update((s) => ({ ...s, isLoading: loading }));
  },

  setError(error: string | null) {
    widgetStore.update((s) => ({ ...s, error }));
  },

  setClerkLoaded(loaded: boolean) {
    widgetStore.update((s) => ({ ...s, clerkLoaded: loaded }));
  },

  setAuthenticated(user: { id: string; email: string; displayName: string }) {
    widgetStore.update((s) => ({
      ...s,
      isAuthenticated: true,
      user,
      currentView: s.currentView === "auth" ? "boards" : s.currentView,
    }));
  },

  logout() {
    widgetStore.update((s) => ({
      ...s,
      isAuthenticated: false,
      user: null,
      userVotes: new Set(),
    }));
  },

  setBoards(boards: any[]) {
    widgetStore.update((s) => ({ ...s, boards }));
  },

  selectBoard(boardId: string, board: any, columns: any[], items: any[]) {
    widgetStore.update((s) => ({
      ...s,
      selectedBoardId: boardId,
      currentBoard: board,
      columns,
      items,
      currentView: "board",
    }));
  },

  goToBoards() {
    widgetStore.update((s) => ({
      ...s,
      selectedBoardId: null,
      currentBoard: null,
      columns: [],
      items: [],
      currentView: "boards",
    }));
  },

  setItems(items: any[]) {
    widgetStore.update((s) => ({ ...s, items }));
  },

  setUserVotes(votes: string[]) {
    widgetStore.update((s) => ({ ...s, userVotes: new Set(votes) }));
  },

  toggleVote(itemId: string, hasVoted: boolean) {
    widgetStore.update((s) => {
      const newVotes = new Set(s.userVotes);
      if (hasVoted) {
        newVotes.add(itemId);
      } else {
        newVotes.delete(itemId);
      }
      // Update item vote count
      const items = s.items.map((item) => {
        if (item._id === itemId) {
          return {
            ...item,
            voteCount: item.voteCount + (hasVoted ? 1 : -1),
          };
        }
        return item;
      });
      return { ...s, userVotes: newVotes, items };
    });
  },

  addItem(item: any) {
    widgetStore.update((s) => ({
      ...s,
      items: [...s.items, item],
    }));
  },

  setCustomization(customization: any) {
    widgetStore.update((s) => ({ ...s, customization }));
  },

  showAuth() {
    widgetStore.update((s) => ({ ...s, currentView: "auth" }));
  },
};
