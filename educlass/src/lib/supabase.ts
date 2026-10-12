import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ponytail: mock fallback — ganti ke Supabase penuh saat env diisi; upgrade: hapus branch db.ts
export const isSupabaseConfigured = Boolean(url && anon);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createClient(url, anon);
  return _client;
}

let _admin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient | null {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !service) return null;
  if (_admin) return _admin;
  _admin = createClient(url, service);
  return _admin;
}
