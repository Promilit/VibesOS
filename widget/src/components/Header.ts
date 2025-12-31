/**
 * Widget Header Component
 */

import { createElement, clearElement, icons } from "../lib/dom";
import { widgetStore, actions } from "../lib/state";
import { getClient } from "../lib/api";

export function renderHeader(container: HTMLElement, customization: any) {
  const state = widgetStore.get();
  clearElement(container);

  const header = createElement("div", { className: "uv-header" });

  // Left side - logo and title
  const leftSide = createElement("div", { className: "uv-header-left" });

  // Back button if viewing a board (and there are multiple boards)
  if (state.currentView === "board" && state.boards.length > 1) {
    const backBtn = createElement("button", {
      className: "uv-tab",
    });
    backBtn.innerHTML = icons.chevronLeft;
    backBtn.style.padding = "4px";
    backBtn.style.marginRight = "4px";
    backBtn.addEventListener("click", () => actions.goToBoards());
    leftSide.appendChild(backBtn);
  }

  // Logo
  if (customization?.logoUrl) {
    const logo = createElement("img", {
      className: "uv-logo",
      src: customization.logoUrl,
      alt: "Logo",
    } as any);
    logo.onerror = () => (logo.style.display = "none");
    leftSide.appendChild(logo);
  }

  // Title
  const title = createElement("h1", { className: "uv-title" }, [
    state.currentBoard?.name || customization?.widgetTitle || "Feedback",
  ]);
  leftSide.appendChild(title);

  header.appendChild(leftSide);

  // Right side - user menu
  const rightSide = createElement("div", { className: "uv-user-menu" });

  if (state.isAuthenticated && state.user) {
    // User info
    const userBadge = createElement("span", { className: "uv-badge" }, [state.user.displayName]);

    // Logout button
    const logoutBtn = createElement("button", { className: "uv-tab" });
    logoutBtn.innerHTML = icons.logout;
    logoutBtn.style.padding = "6px";
    logoutBtn.title = "Sign out";
    logoutBtn.addEventListener("click", async () => {
      const client = getClient();
      if (client) {
        await client.signOut();
      }
      actions.logout();
    });

    rightSide.appendChild(userBadge);
    rightSide.appendChild(logoutBtn);
  } else {
    // Sign in button
    const signInBtn = createElement("button", { className: "uv-tab" }, ["Sign In"]);
    signInBtn.addEventListener("click", () => actions.showAuth());
    rightSide.appendChild(signInBtn);
  }

  header.appendChild(rightSide);
  container.appendChild(header);
}
