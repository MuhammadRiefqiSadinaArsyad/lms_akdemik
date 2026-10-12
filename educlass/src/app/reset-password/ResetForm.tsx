"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/** Sesi recovery datang lewat hash (implicit) atau ?code= (PKCE) — dua-duanya ditangani di browser. */
export function ResetForm({ code }: { code: string | null }) {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
      setReady(true);
    })();
  }, [code]);

  async function submit(formData: FormData) {
    const supabase = getSupabase();
    if (!supabase) return;
    const password = String(formData.get("password") ?? "");
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    window.location.href = "/login";
  }

  if (!ready) return <p className="mt-12 text-sm text-muted">Memeriksa tautan…</p>;

  if (done) return <p className="mt-12 text-sm">Password diperbarui. Silakan masuk.</p>;

  if (!hasSession) {
    return (
      <p className="mt-12 max-w-md border border-line px-6 py-8 text-sm">
        Tautan reset tidak valid atau sudah dipakai. Minta tautan baru di halaman{" "}
        <a href="/forgot-password" className="u-link font-medium">lupa password</a>.
      </p>
    );
  }

  return (
    <form action={submit} className="mt-12 max-w-md space-y-7">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Password baru</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-2 w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-muted">{error}</p>}
      <button
        type="submit"
        className="w-full border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Simpan Password Baru
      </button>
    </form>
  );
}