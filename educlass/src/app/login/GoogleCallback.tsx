"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { completeGoogleLogin } from "./googleAction";

/** Supabase OAuth balik ke /login dengan token di hash (implicit) atau ?code= (PKCE). */
export function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code && !window.location.hash.includes("access_token")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => null);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) await completeGoogleLogin(token);
    })();
  }, []);

  return null;
}