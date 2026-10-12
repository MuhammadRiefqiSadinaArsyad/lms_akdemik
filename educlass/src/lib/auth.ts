import { cookies } from "next/headers";
import { db } from "./db";
import type { Profile } from "./types";
import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export const SESSION_COOKIE = "ec_session";

export async function getSessionUser(): Promise<Profile | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) {
    // fallback: coba Supabase Auth session (mis. OAuth) bila ada
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabase();
        const { data } = await supabase!.auth.getUser();
        if (data.user) {
          const client = getSupabaseAdmin() ?? supabase;
          const { data: row } = await client!.from("profiles").select("*").eq("id", data.user.id).single();
          if (row) return row as Profile;
        }
      } catch {}
    }
    return null;
  }
  // ponytail: Supabase bila env ada — ambil profiles dari Supabase dulu, fallback mock
  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseAdmin() ?? getSupabase();
      const { data: row } = await client!.from("profiles").select("*").eq("id", id).single();
      if (row) return row as Profile;
    } catch {}
  }
  return db.profiles.find((p) => p.id === id) ?? null;
}

export async function setSession(id: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  if (isSupabaseConfigured) {
    try {
      await getSupabase()?.auth.signOut();
    } catch {}
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function login(identifier: string, password: string): Promise<{ profile: Profile } | { error: string }> {
  if (isSupabaseConfigured) {
    try {
      const admin = getSupabaseAdmin();
      if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };
      const key = identifier.trim().toLowerCase();
      // email maupun NIM resolving ke profile asli Supabase; password dicek Supabase Auth
      const { data: row, error: lookupError } = await admin
        .from("profiles")
        .select("*")
        .or(`email.eq.${key},nim.eq.${key}`)
        .maybeSingle();
      if (lookupError) return { error: `Gagal masuk: ${lookupError.message}` };
      if (!row) return { error: "Akun tidak ditemukan." };

      const { data, error } = await getSupabase()!.auth.signInWithPassword({ email: row.email, password });
      if (error || !data.user) {
        const message = error?.message.toLowerCase() ?? "";
        return { error: message.includes("invalid") ? "Password salah." : error?.message ?? "Password salah." };
      }

      await setSession(row.id);
      return { profile: row as Profile };
    } catch (e) {
      return { error: `Gagal masuk: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
  const key = identifier.trim().toLowerCase();
  const profile =
    db.profiles.find((p) => p.email.toLowerCase() === key || (p.nim !== null && p.nim === key)) ?? null;
  if (!profile) return { error: "Akun tidak ditemukan." };
  if (db.passwords[profile.id] !== password) return { error: "Password salah." };
  return { profile };
}

export async function registerStudent(input: {
  name: string;
  nim: string;
  email: string;
  password: string;
}): Promise<{ profile: Profile } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !input.nim.trim() || !email || !input.password) return { error: "Semua kolom wajib diisi." };
  if (isSupabaseConfigured) {
    try {
      const admin = getSupabaseAdmin() ?? getSupabase()!;
      const nim = input.nim.trim();
      const name = input.name.trim();
      // signUp (anon) kena rate limit email proyek; createUser via service_role tidak,
      // dan email_confirm:true membuat akun langsung bisa login tanpa email konfirmasi.
      if (!admin.auth.admin) return { error: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };
      const clash = await admin.from("profiles").select("nim,email").or(`email.eq.${email},nim.eq.${nim}`).maybeSingle();
      if (clash.error) return { error: `Gagal cek data: ${clash.error.message}` };
      if (clash.data?.email) return { error: "Email sudah terdaftar." };
      if (clash.data?.nim) return { error: "NIM sudah terdaftar." };

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name, nim, role: "student" },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered")) return { error: "Email sudah terdaftar." };
        if (msg.includes("rate limit") || msg.includes("too many"))
          return { error: "Terlalu banyak percobaan pendaftaran dari alamat ini. Coba lagi nanti." };
        if (msg.includes("password")) return { error: "Password tidak memenuhi syarat minimal." };
        return { error: `Gagal mendaftar: ${error.message}` };
      }
      if (!data.user) return { error: "Gagal mendaftar: akun tidak terbentuk." };

      const saved = await admin
        .from("profiles")
        .upsert({ id: data.user.id, name, nim, email, role: "student" }, { onConflict: "id" })
        .select();
      if (saved.error) return { error: `Akun dibuat tetapi profil gagal disimpan: ${saved.error.message}` };

      return {
        profile: { id: data.user.id, name, nim, nip: null, email, role: "student", created_at: new Date().toISOString() },
      };
    } catch (e) {
      // ponytail: pesan error asli dibiarkan terlihat — jangan fallback ke mock,
      // itu yang bikin registrasi dulu melaporkan sukses padahal tidak tersimpan.
      return { error: `Gagal mendaftar: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
  if (db.profiles.some((p) => p.email.toLowerCase() === email)) return { error: "Email sudah terdaftar." };
  if (db.profiles.some((p) => p.nim === input.nim.trim())) return { error: "NIM sudah terdaftar." };
  const id = crypto.randomUUID();
  const profile: Profile = {
    id,
    name: input.name.trim(),
    nim: input.nim.trim(),
    nip: null,
    email,
    role: "student",
    created_at: new Date().toISOString(),
  };
  db.profiles.push(profile);
  db.passwords[profile.id] = input.password;
  return { profile };
}
