/**
 * Authentication helpers for widget users
 * Shared utilities that don't require Node.js runtime
 * Note: JWT generation/verification is in actions.ts (requires Node.js crypto)
 */

/**
 * Decode JWT payload without verification
 * Used to extract userId for session lookup
 * IMPORTANT: Only use after token is verified via session lookup
 */
export function decodeJwtPayload(token: string): {
  userId: string;
  apiKeyUserId: string;
  email: string;
  iat: number;
  exp: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [, encodedPayload] = parts;
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    return payload;
  } catch {
    return null;
  }
}

/**
 * Base64 URL decode a string
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }

  // Decode using TextDecoder (available in V8 runtime)
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }

  return { valid: true };
}

/**
 * Validate hex color code
 */
export function validateHexColor(color: string): boolean {
  const hexRegex = /^#[0-9A-F]{6}$/i;
  return hexRegex.test(color);
}
