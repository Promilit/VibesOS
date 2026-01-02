/**
 * Board List Component
 * Displays tabs for selecting between Feature Requests, Bug Reports, and Internal Roadmap boards
 */

import { createElement, clearElement } from "../lib/dom";
import { widgetStore, actions } from "../lib/state";
import { getClient } from "../lib/api";

export function renderBoardList(container: HTMLElement) {
  const state = widgetStore.get();
  clearElement(container);

  const boardListContainer = createElement("div", {
    className: "uv-board-list-container",
  });

  // If no boards available
  if (state.boards.length === 0) {
    const emptyMessage = createElement("div", { className: "uv-empty-state" });
    emptyMessage.style.padding = "48px 24px";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "var(--uv-text-muted)";
    emptyMessage.textContent = "No boards available";
    boardListContainer.appendChild(emptyMessage);
    container.appendChild(boardListContainer);
    return;
  }

  // If only one board, automatically select it
  if (state.boards.length === 1) {
    const board = state.boards[0];
    loadAndSelectBoard(board._id);
    return;
  }

  // Title
  const title = createElement("h2", { className: "uv-board-list-title" }, [
    "Select a Board",
  ]);
  title.style.marginBottom = "24px";
  title.style.fontSize = "24px";
  title.style.fontWeight = "600";
  boardListContainer.appendChild(title);

  // Boards grid
  const boardsGrid = createElement("div", { className: "uv-boards-grid" });
  boardsGrid.style.display = "grid";
  boardsGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))";
  boardsGrid.style.gap = "16px";

  state.boards.forEach((board) => {
    const boardCard = createElement("div", { className: "uv-board-card" });
    boardCard.style.padding = "20px";
    boardCard.style.border = "1px solid var(--uv-border)";
    boardCard.style.borderRadius = "var(--uv-border-radius, 8px)";
    boardCard.style.cursor = "pointer";
    boardCard.style.transition = "all 0.2s ease";
    boardCard.style.backgroundColor = "var(--uv-card-background)";

    // Hover effect
    boardCard.addEventListener("mouseenter", () => {
      boardCard.style.borderColor = "var(--uv-primary)";
      boardCard.style.transform = "translateY(-2px)";
      boardCard.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    });

    boardCard.addEventListener("mouseleave", () => {
      boardCard.style.borderColor = "var(--uv-border)";
      boardCard.style.transform = "translateY(0)";
      boardCard.style.boxShadow = "none";
    });

    // Board name
    const boardName = createElement("h3", { className: "uv-board-name" }, [
      board.name,
    ]);
    boardName.style.fontSize = "18px";
    boardName.style.fontWeight = "600";
    boardName.style.marginBottom = "8px";
    boardName.style.color = "var(--uv-text)";

    // Board description (if available)
    if (board.description) {
      const boardDesc = createElement("p", { className: "uv-board-desc" }, [
        board.description,
      ]);
      boardDesc.style.fontSize = "14px";
      boardDesc.style.color = "var(--uv-text-muted)";
      boardDesc.style.marginBottom = "16px";
      boardCard.appendChild(boardDesc);
    }

    boardCard.appendChild(boardName);

    // Click to select board
    boardCard.addEventListener("click", () => {
      loadAndSelectBoard(board._id);
    });

    boardsGrid.appendChild(boardCard);
  });

  boardListContainer.appendChild(boardsGrid);
  container.appendChild(boardListContainer);
}

// Helper function to load board data and select it
async function loadAndSelectBoard(boardId: string) {
  const state = widgetStore.get();
  const board = state.boards.find((b) => b._id === boardId);
  if (!board) return;

  actions.setLoading(true);

  try {
    const client = getClient();
    if (!client) {
      throw new Error("API client not initialized");
    }

    // Get board with columns
    const boardData = await client.getProjectWithColumns(boardId);
    if (!boardData) {
      throw new Error("Board not found");
    }

    // Get items for this board
    const items = await client.getProjectItems(boardId);

    // Get user votes if authenticated
    let userVotes: string[] = [];
    if (state.isAuthenticated && state.user) {
      userVotes = await client.getUserVotes(boardId);
    }

    // Update state with selected board
    actions.setUserVotes(userVotes);
    actions.selectBoard(boardId, boardData.project, boardData.columns, items);
    actions.setLoading(false);
  } catch (error: any) {
    actions.setError(error.message || "Failed to load board");
    actions.setLoading(false);
  }
}
