/**
 * Lightweight, dependency-free admin session — Edge & Node compatible.
 * Uses the Web Crypto API (available in both the Edge middleware runtime
 * and the Node.js server runtime), so the same code verifies sessions
 * everywhere.
 *
 * Token format: base64url(payload) + "." + base64url(HMAC-SHA256(payload))
 */

export const ADMIN_COOKIE = "bb_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Set a 32+ char random string in .env.local",
    );
  }
  return secret;
}

function bytesToB64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64url(str: string): string {
  return bytesToB64url(encoder.encode(str));
}

function b64urlToStr(s: string): string {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToB64url(sig);
}

function constTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Create a signed session token after a successful login. */
export async function createSessionToken(username: string): Promise<string> {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  });
  const encoded = strToB64url(payload);
  const sig = await hmac(encoded);
  return `${encoded}.${sig}`;
}

/** Verify a token's signature and expiry. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return false;

  let expected: string;
  try {
    expected = await hmac(encoded);
  } catch {
    return false;
  }
  if (!constTimeEqual(sig, expected)) return false;

  try {
    const { exp } = JSON.parse(b64urlToStr(encoded));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

/** Constant-time check of submitted credentials against env. */
export function verifyCredentials(username: string, password: string): boolean {
  const U = process.env.ADMIN_USERNAME ?? "";
  const P = process.env.ADMIN_PASSWORD ?? "";
  if (!U || !P) return false;
  return constTimeEqual(username, U) && constTimeEqual(password, P);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
