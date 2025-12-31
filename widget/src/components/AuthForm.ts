/**
 * Authentication Form Component
 * Uses Clerk for authentication
 */

import { createElement, clearElement } from "../lib/dom";
import { widgetStore, actions } from "../lib/state";
import { getClient } from "../lib/api";

export function renderAuthForm(container: HTMLElement) {
  const state = widgetStore.get();
  clearElement(container);

  const authContainer = createElement("div", { className: "uv-auth-container" });

  // Title
  const title = createElement("h2", { className: "uv-auth-title" }, [
    "Sign in to continue",
  ]);

  const subtitle = createElement("p", { className: "uv-auth-subtitle" }, [
    "Sign in to vote on features and submit your ideas",
  ]);

  // Buttons container
  const buttonsDiv = createElement("div", { className: "uv-auth-buttons" });

  // Sign In button
  const signInBtn = createElement("button", {
    className: "uv-submit-btn",
  } as any, ["Sign In"]);

  signInBtn.addEventListener("click", async () => {
    const client = getClient();
    if (client) {
      signInBtn.disabled = true;
      signInBtn.textContent = "Opening...";
      try {
        await client.signIn();
      } finally {
        signInBtn.disabled = false;
        signInBtn.textContent = "Sign In";
      }
    }
  });

  buttonsDiv.appendChild(signInBtn);

  // Sign Up button
  const signUpBtn = createElement("button", {
    className: "uv-secondary-btn",
  } as any, ["Create Account"]);

  signUpBtn.addEventListener("click", async () => {
    const client = getClient();
    if (client) {
      signUpBtn.disabled = true;
      signUpBtn.textContent = "Opening...";
      try {
        await client.signUp();
      } finally {
        signUpBtn.disabled = false;
        signUpBtn.textContent = "Create Account";
      }
    }
  });

  buttonsDiv.appendChild(signUpBtn);

  // Skip link (continue as guest)
  const skipDiv = createElement("div", { className: "uv-auth-switch" });
  skipDiv.style.marginTop = "16px";
  const skipLink = createElement("button", { className: "uv-auth-link" }, ["Continue as guest"]);
  skipLink.addEventListener("click", () => {
    actions.goToBoards();
  });
  skipDiv.appendChild(skipLink);

  // Info text
  const infoDiv = createElement("div", { className: "uv-auth-info" });
  infoDiv.style.marginTop = "16px";
  infoDiv.style.fontSize = "12px";
  infoDiv.style.color = "var(--uv-text-muted)";
  infoDiv.textContent = state.clerkLoaded
    ? "Secure authentication powered by Clerk"
    : "Loading authentication...";

  authContainer.appendChild(title);
  authContainer.appendChild(subtitle);
  authContainer.appendChild(buttonsDiv);
  authContainer.appendChild(skipDiv);
  authContainer.appendChild(infoDiv);

  container.appendChild(authContainer);
}
