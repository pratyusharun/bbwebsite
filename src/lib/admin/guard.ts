import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/auth";

/**
 * Throws if the caller does not hold a valid admin session cookie.
 * Used to protect server actions (which the route middleware does not cover).
 */
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (!ok) throw new Error("Unauthorized");
}
