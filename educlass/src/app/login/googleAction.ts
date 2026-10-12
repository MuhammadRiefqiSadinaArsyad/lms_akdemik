"use server";

import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

/** Token dari Google diverifikasi ulang di server (bukan dipercaya dari client),
 *  lalu profil dicocokkan lewat email; akun baru otomatis jadi student. */
export async function completeGoogleLogin(accessToken: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) return;

  const email = (data.user.email ?? "").toLowerCase();
  if (!email) return;

  const { data: existing } = await admin.from("profiles").select("*").eq("email", email).maybeSingle();
  let profile = existing as Profile | null;

  if (!profile) {
    const name =
      (data.user.user_metadata?.full_name as string | undefined) ??
      (data.user.user_metadata?.name as string | undefined) ??
      email.split("@")[0];
    const { data: created } = await admin
      .from("profiles")
      .insert({ id: data.user.id, name, nim: null, email, role: "student" })
      .select()
      .maybeSingle();
    profile = created as Profile | null;
  }

  if (!profile) return;
  await setSession(profile.id);
  redirect(profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
}