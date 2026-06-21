"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the public ANON key.
 * Subject to Row Level Security. Currently optional — the registration flow
 * goes through a server action — but provided for any client-side reads you
 * may add later (e.g. a public live counter).
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  { auth: { persistSession: false } },
);
