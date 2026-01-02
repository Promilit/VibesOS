/**
 * DOM Utility Functions
 * Simple helpers for creating and managing DOM elements
 */

export function createElement(
  tag: string,
  attributes?: Record<string, any>,
  children?: (string | Node)[]
): HTMLElement {
  const element = document.createElement(tag);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else if (key.startsWith("data-")) {
        element.setAttribute(key, value);
      } else {
        (element as any)[key] = value;
      }
    });
  }

  if (children) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

export function clearElement(element: HTMLElement) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Common icons as SVG strings
export const icons = {
  chevronLeft: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  logout: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  thumbsUp: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.25 18.3333H3.33333C2.89131 18.3333 2.46738 18.1577 2.15482 17.8452C1.84226 17.5326 1.66667 17.1087 1.66667 16.6667V10.8333C1.66667 10.3913 1.84226 9.96738 2.15482 9.65482C2.46738 9.34226 2.89131 9.16667 3.33333 9.16667H6.25M11.6667 7.5V4.16667C11.6667 3.50363 11.4033 2.86774 10.9345 2.3989C10.4656 1.93006 9.82971 1.66667 9.16667 1.66667L6.25 9.16667V18.3333H15.3917C15.7859 18.3379 16.1682 18.2007 16.4696 17.9465C16.771 17.6923 16.972 17.3382 17.0333 16.95L18.2 8.95C18.2397 8.69947 18.2245 8.44334 18.1554 8.19898C18.0863 7.95461 17.9649 7.72766 17.7992 7.53385C17.6334 7.34004 17.4271 7.18391 17.1939 7.07612C16.9607 6.96833 16.7062 6.9115 16.4483 6.90833H11.6667Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  plus: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  edit: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.16667 3.33333H3.33333C2.89131 3.33333 2.46738 3.50893 2.15482 3.82149C1.84226 4.13405 1.66667 4.55797 1.66667 5V16.6667C1.66667 17.1087 1.84226 17.5326 2.15482 17.8452C2.46738 18.1577 2.89131 18.3333 3.33333 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V10.8333M15.4167 2.08333C15.7482 1.75181 16.1977 1.56558 16.6667 1.56558C17.1357 1.56558 17.5851 1.75181 17.9167 2.08333C18.2482 2.41485 18.4344 2.86428 18.4344 3.33333C18.4344 3.80238 18.2482 4.25181 17.9167 4.58333L10 12.5L6.66667 13.3333L7.5 10L15.4167 2.08333Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  trash: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5H4.16667H17.5M15.8333 5V16.6667C15.8333 17.1087 15.6577 17.5326 15.3452 17.8452C15.0326 18.1577 14.6087 18.3333 14.1667 18.3333H5.83333C5.39131 18.3333 4.96738 18.1577 4.65482 17.8452C4.34226 17.5326 4.16667 17.1087 4.16667 16.6667V5M6.66667 5V3.33333C6.66667 2.89131 6.84226 2.46738 7.15482 2.15482C7.46738 1.84226 7.89131 1.66667 8.33333 1.66667H11.6667C12.1087 1.66667 12.5326 1.84226 12.8452 2.15482C13.1577 2.46738 13.3333 2.89131 13.3333 3.33333V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  message: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 9.58333C17.5029 10.6832 17.2459 11.7683 16.75 12.75C16.162 13.9264 15.2581 14.916 14.1395 15.6077C13.021 16.2995 11.7319 16.6662 10.4167 16.6667C9.31678 16.6695 8.23176 16.4126 7.25 15.9167L2.5 17.5L4.08333 12.75C3.58744 11.7683 3.33047 10.6832 3.33333 9.58333C3.33384 8.26812 3.70051 6.97904 4.39227 5.86045C5.08402 4.74187 6.07355 3.838 7.25 3.25C8.23176 2.75411 9.31678 2.49713 10.4167 2.5H10.8333C12.5703 2.59582 14.2109 3.32896 15.441 4.55904C16.671 5.78912 17.4042 7.4297 17.5 9.16667V9.58333Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};
