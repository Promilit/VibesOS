/**
 * Board View Component
 * Displays a kanban board with columns and items
 * Supports voting, adding items (to Backlog only), and viewing items
 */

import { createElement, clearElement, icons } from "../lib/dom";
import { widgetStore, actions } from "../lib/state";
import { getClient } from "../lib/api";

export function renderBoardView(container: HTMLElement) {
  const state = widgetStore.get();
  clearElement(container);

  if (!state.currentBoard || state.columns.length === 0) {
    const emptyMessage = createElement("div", { className: "uv-empty-state" });
    emptyMessage.style.padding = "48px 24px";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "var(--uv-text-muted)";
    emptyMessage.textContent = "No board selected";
    container.appendChild(emptyMessage);
    return;
  }

  const boardContainer = createElement("div", { className: "uv-board-container" });

  // Columns container (horizontal scroll for mobile)
  const columnsContainer = createElement("div", { className: "uv-columns-container" });
  columnsContainer.style.display = "flex";
  columnsContainer.style.gap = "16px";
  columnsContainer.style.overflowX = "auto";
  columnsContainer.style.padding = "8px";
  columnsContainer.style.minHeight = "400px";

  // Sort columns by order
  const sortedColumns = [...state.columns].sort((a, b) => a.order - b.order);

  sortedColumns.forEach((column) => {
    const columnEl = renderColumn(column, state);
    columnsContainer.appendChild(columnEl);
  });

  boardContainer.appendChild(columnsContainer);
  container.appendChild(boardContainer);
}

function renderColumn(column: any, state: any): HTMLElement {
  const columnEl = createElement("div", { className: "uv-column" });
  columnEl.style.flex = "0 0 280px";
  columnEl.style.backgroundColor = "var(--uv-card-background)";
  columnEl.style.border = "1px solid var(--uv-border)";
  columnEl.style.borderRadius = "var(--uv-border-radius, 8px)";
  columnEl.style.padding = "12px";
  columnEl.style.maxHeight = "600px";
  columnEl.style.display = "flex";
  columnEl.style.flexDirection = "column";

  // Column header
  const header = createElement("div", { className: "uv-column-header" });
  header.style.marginBottom = "12px";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const columnName = createElement("h3", { className: "uv-column-name" }, [
    column.name,
  ]);
  columnName.style.fontSize = "16px";
  columnName.style.fontWeight = "600";
  columnName.style.color = "var(--uv-text)";

  // Count items in this column
  const itemsInColumn = state.items.filter((item: any) => item.columnId === column._id);
  const count = createElement("span", { className: "uv-column-count" }, [
    `${itemsInColumn.length}`,
  ]);
  count.style.fontSize = "14px";
  count.style.color = "var(--uv-text-muted)";
  count.style.backgroundColor = "var(--uv-background)";
  count.style.padding = "2px 8px";
  count.style.borderRadius = "12px";

  header.appendChild(columnName);
  header.appendChild(count);
  columnEl.appendChild(header);

  // Add button (only for Backlog column)
  const isBacklogColumn = column.slug === "backlog" || column.name.toLowerCase().includes("backlog");
  if (isBacklogColumn && state.isAuthenticated) {
    const addBtn = createElement("button", { className: "uv-add-item-btn" });
    addBtn.style.width = "100%";
    addBtn.style.padding = "8px 12px";
    addBtn.style.marginBottom = "12px";
    addBtn.style.border = "1px dashed var(--uv-border)";
    addBtn.style.borderRadius = "var(--uv-border-radius, 8px)";
    addBtn.style.backgroundColor = "transparent";
    addBtn.style.color = "var(--uv-text-muted)";
    addBtn.style.cursor = "pointer";
    addBtn.style.display = "flex";
    addBtn.style.alignItems = "center";
    addBtn.style.justifyContent = "center";
    addBtn.style.gap = "8px";
    addBtn.style.fontSize = "14px";
    addBtn.style.transition = "all 0.2s ease";

    addBtn.innerHTML = icons.plus;
    const btnText = createElement("span", {}, ["Add Item"]);
    addBtn.appendChild(btnText);

    addBtn.addEventListener("mouseenter", () => {
      addBtn.style.borderColor = "var(--uv-primary)";
      addBtn.style.color = "var(--uv-primary)";
      addBtn.style.backgroundColor = "rgba(0, 0, 0, 0.02)";
    });

    addBtn.addEventListener("mouseleave", () => {
      addBtn.style.borderColor = "var(--uv-border)";
      addBtn.style.color = "var(--uv-text-muted)";
      addBtn.style.backgroundColor = "transparent";
    });

    addBtn.addEventListener("click", () => {
      showAddItemDialog(state.currentBoard._id, column._id);
    });

    columnEl.appendChild(addBtn);
  }

  // Items container (scrollable)
  const itemsContainer = createElement("div", { className: "uv-items-container" });
  itemsContainer.style.flex = "1";
  itemsContainer.style.overflowY = "auto";
  itemsContainer.style.display = "flex";
  itemsContainer.style.flexDirection = "column";
  itemsContainer.style.gap = "8px";

  if (itemsInColumn.length === 0) {
    const emptyMessage = createElement("div", { className: "uv-column-empty" });
    emptyMessage.style.padding = "16px";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "var(--uv-text-muted)";
    emptyMessage.style.fontSize = "14px";
    emptyMessage.textContent = "No items";
    itemsContainer.appendChild(emptyMessage);
  } else {
    // Sort items by position
    const sortedItems = [...itemsInColumn].sort((a: any, b: any) => a.position - b.position);
    sortedItems.forEach((item: any) => {
      const itemEl = renderItem(item, state);
      itemsContainer.appendChild(itemEl);
    });
  }

  columnEl.appendChild(itemsContainer);
  return columnEl;
}

function renderItem(item: any, state: any): HTMLElement {
  const itemEl = createElement("div", { className: "uv-item-card" });
  itemEl.style.padding = "12px";
  itemEl.style.backgroundColor = "var(--uv-background)";
  itemEl.style.border = "1px solid var(--uv-border)";
  itemEl.style.borderRadius = "var(--uv-border-radius, 6px)";
  itemEl.style.cursor = "pointer";
  itemEl.style.transition = "all 0.2s ease";

  // Hover effect
  itemEl.addEventListener("mouseenter", () => {
    itemEl.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    itemEl.style.transform = "translateY(-1px)";
  });

  itemEl.addEventListener("mouseleave", () => {
    itemEl.style.boxShadow = "none";
    itemEl.style.transform = "translateY(0)";
  });

  // Item title
  const title = createElement("h4", { className: "uv-item-title" }, [item.title]);
  title.style.fontSize = "14px";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";
  title.style.color = "var(--uv-text)";
  title.style.wordBreak = "break-word";
  itemEl.appendChild(title);

  // Item description (if available)
  if (item.description) {
    const description = createElement("p", { className: "uv-item-description" }, [
      item.description,
    ]);
    description.style.fontSize = "13px";
    description.style.color = "var(--uv-text-muted)";
    description.style.marginBottom = "12px";
    description.style.wordBreak = "break-word";
    description.style.display = "-webkit-box";
    description.style.webkitLineClamp = "3";
    description.style.webkitBoxOrient = "vertical";
    description.style.overflow = "hidden";
    itemEl.appendChild(description);
  }

  // Footer with vote button and stats
  const footer = createElement("div", { className: "uv-item-footer" });
  footer.style.display = "flex";
  footer.style.justifyContent = "space-between";
  footer.style.alignItems = "center";
  footer.style.marginTop = "8px";

  // Vote button
  const hasVoted = state.userVotes.has(item._id);
  const voteBtn = createElement("button", { className: "uv-vote-btn" });
  voteBtn.style.display = "flex";
  voteBtn.style.alignItems = "center";
  voteBtn.style.gap = "6px";
  voteBtn.style.padding = "4px 10px";
  voteBtn.style.border = hasVoted ? "1px solid var(--uv-primary)" : "1px solid var(--uv-border)";
  voteBtn.style.borderRadius = "16px";
  voteBtn.style.backgroundColor = hasVoted ? "var(--uv-primary)" : "transparent";
  voteBtn.style.color = hasVoted ? "white" : "var(--uv-text)";
  voteBtn.style.cursor = state.isAuthenticated ? "pointer" : "not-allowed";
  voteBtn.style.fontSize = "13px";
  voteBtn.style.transition = "all 0.2s ease";

  const voteIcon = createElement("span", {});
  voteIcon.innerHTML = icons.thumbsUp;
  voteIcon.style.display = "flex";
  voteIcon.style.alignItems = "center";

  const voteCount = createElement("span", {}, [`${item.voteCount || 0}`]);

  voteBtn.appendChild(voteIcon);
  voteBtn.appendChild(voteCount);

  if (state.isAuthenticated) {
    voteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await handleVote(item._id, hasVoted);
    });

    voteBtn.addEventListener("mouseenter", () => {
      if (!hasVoted) {
        voteBtn.style.borderColor = "var(--uv-primary)";
        voteBtn.style.backgroundColor = "rgba(0, 0, 0, 0.02)";
      }
    });

    voteBtn.addEventListener("mouseleave", () => {
      if (!hasVoted) {
        voteBtn.style.borderColor = "var(--uv-border)";
        voteBtn.style.backgroundColor = "transparent";
      }
    });
  } else {
    voteBtn.title = "Sign in to vote";
  }

  footer.appendChild(voteBtn);

  // Comment count (if available)
  if (item.commentCount > 0) {
    const commentBadge = createElement("span", { className: "uv-comment-badge" });
    commentBadge.style.display = "flex";
    commentBadge.style.alignItems = "center";
    commentBadge.style.gap = "4px";
    commentBadge.style.fontSize = "13px";
    commentBadge.style.color = "var(--uv-text-muted)";

    const commentIcon = createElement("span", {});
    commentIcon.innerHTML = icons.message;
    commentIcon.style.display = "flex";
    commentIcon.style.alignItems = "center";

    const commentCount = createElement("span", {}, [`${item.commentCount}`]);

    commentBadge.appendChild(commentIcon);
    commentBadge.appendChild(commentCount);
    footer.appendChild(commentBadge);
  }

  itemEl.appendChild(footer);
  return itemEl;
}

// Handle voting
async function handleVote(itemId: string, hasVoted: boolean) {
  const client = getClient();
  if (!client) return;

  try {
    // Optimistically update UI
    actions.toggleVote(itemId, !hasVoted);

    // Call API
    if (hasVoted) {
      await client.unvote(itemId);
    } else {
      await client.vote(itemId);
    }
  } catch (error: any) {
    // Revert on error
    actions.toggleVote(itemId, hasVoted);
    console.error("Vote failed:", error);
  }
}

// Show add item dialog
function showAddItemDialog(boardId: string, columnId: string) {
  // Create modal overlay
  const overlay = createElement("div", { className: "uv-modal-overlay" });
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "1000";

  // Create modal
  const modal = createElement("div", { className: "uv-modal" });
  modal.style.backgroundColor = "var(--uv-background)";
  modal.style.padding = "24px";
  modal.style.borderRadius = "var(--uv-border-radius, 8px)";
  modal.style.maxWidth = "500px";
  modal.style.width = "90%";
  modal.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";

  // Title
  const modalTitle = createElement("h3", {}, ["Add New Item"]);
  modalTitle.style.fontSize = "20px";
  modalTitle.style.fontWeight = "600";
  modalTitle.style.marginBottom = "16px";
  modalTitle.style.color = "var(--uv-text)";
  modal.appendChild(modalTitle);

  // Form
  const form = createElement("form", {});
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "16px";

  // Title input
  const titleLabel = createElement("label", {}, ["Title"]);
  titleLabel.style.fontSize = "14px";
  titleLabel.style.fontWeight = "500";
  titleLabel.style.color = "var(--uv-text)";

  const titleInput = createElement("input", {
    type: "text",
    placeholder: "Enter a title...",
    required: true,
  } as any);
  titleInput.style.padding = "10px 12px";
  titleInput.style.border = "1px solid var(--uv-border)";
  titleInput.style.borderRadius = "var(--uv-border-radius, 6px)";
  titleInput.style.fontSize = "14px";
  titleInput.style.color = "var(--uv-text)";
  titleInput.style.backgroundColor = "var(--uv-card-background)";

  const titleGroup = createElement("div", {});
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);
  form.appendChild(titleGroup);

  // Description textarea
  const descLabel = createElement("label", {}, ["Description (optional)"]);
  descLabel.style.fontSize = "14px";
  descLabel.style.fontWeight = "500";
  descLabel.style.color = "var(--uv-text)";

  const descInput = createElement("textarea", {
    placeholder: "Enter a description...",
    rows: "4",
  } as any);
  descInput.style.padding = "10px 12px";
  descInput.style.border = "1px solid var(--uv-border)";
  descInput.style.borderRadius = "var(--uv-border-radius, 6px)";
  descInput.style.fontSize = "14px";
  descInput.style.color = "var(--uv-text)";
  descInput.style.backgroundColor = "var(--uv-card-background)";
  descInput.style.resize = "vertical";
  descInput.style.fontFamily = "inherit";

  const descGroup = createElement("div", {});
  descGroup.appendChild(descLabel);
  descGroup.appendChild(descInput);
  form.appendChild(descGroup);

  // Buttons
  const buttons = createElement("div", {});
  buttons.style.display = "flex";
  buttons.style.gap = "12px";
  buttons.style.justifyContent = "flex-end";

  const cancelBtn = createElement("button", { type: "button" }, ["Cancel"]);
  cancelBtn.style.padding = "10px 20px";
  cancelBtn.style.border = "1px solid var(--uv-border)";
  cancelBtn.style.borderRadius = "var(--uv-border-radius, 6px)";
  cancelBtn.style.backgroundColor = "transparent";
  cancelBtn.style.color = "var(--uv-text)";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.fontSize = "14px";

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  const submitBtn = createElement("button", { type: "submit" }, ["Add Item"]);
  submitBtn.style.padding = "10px 20px";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "var(--uv-border-radius, 6px)";
  submitBtn.style.backgroundColor = "var(--uv-primary)";
  submitBtn.style.color = "white";
  submitBtn.style.cursor = "pointer";
  submitBtn.style.fontSize = "14px";
  submitBtn.style.fontWeight = "500";

  buttons.appendChild(cancelBtn);
  buttons.appendChild(submitBtn);
  form.appendChild(buttons);

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = (titleInput as HTMLInputElement).value.trim();
    const description = (descInput as HTMLTextAreaElement).value.trim();

    if (!title) return;

    submitBtn.textContent = "Adding...";
    (submitBtn as HTMLButtonElement).disabled = true;

    try {
      const client = getClient();
      if (!client) throw new Error("API client not initialized");

      const result = await client.createItem(boardId, title, description || undefined);

      if (result.success) {
        // Reload board data
        const state = widgetStore.get();
        const items = await client.getProjectItems(boardId);
        actions.setItems(items);

        document.body.removeChild(overlay);
      } else {
        alert(result.error || "Failed to add item");
        submitBtn.textContent = "Add Item";
        (submitBtn as HTMLButtonElement).disabled = false;
      }
    } catch (error: any) {
      alert(error.message || "Failed to add item");
      submitBtn.textContent = "Add Item";
      (submitBtn as HTMLButtonElement).disabled = false;
    }
  });

  modal.appendChild(form);
  overlay.appendChild(modal);

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
  (titleInput as HTMLInputElement).focus();
}
