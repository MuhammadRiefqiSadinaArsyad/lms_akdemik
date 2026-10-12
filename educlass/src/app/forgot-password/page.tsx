import { redirect } from "next/navigation";
import { AuthLayout, AuthBrand } from "@/components/AuthLayout";
import { Btn, Field, TextInput } from "@/components/ui";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

async function sendResetLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;
  const supabase = getSupabase();
  if (!supabase) return;
  // selalu sukses: membocorkan email terdaftar jadi celah enumerasi akun
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
  });
  redirect("/forgot-password?sent=1");
}

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <AuthLayout>
      <AuthBrand />
      <div>
        <h1 className="font-serif text-5xl leading-tight xl:text-6xl">Lupa password.</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Masukkan email akunmu. Kami kirim tautan untuk membuat password baru.
        </p>

        {sent ? (
          <p className="mt-12 max-w-md border border-line px-6 py-8 text-sm">
            Kalau email itu terdaftar, tautan reset sudah dikirim. Cek inbox (dan folder spam).
          </p>
        ) : (
          <form action={sendResetLink} className="mt-12 max-w-md space-y-7">
            <Field label="Email" htmlFor="email">
              <TextInput id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Btn type="submit" className="w-full">Kirim Tautan Reset <span aria-hidden>→</span></Btn>
          </form>
        )}

        <p className="mt-10 text-sm text-muted">
          Ingat passwordnya?{" "}
          <a href="/login" className="u-link font-medium text-foreground">
            Kembali ke masuk →
          </a>
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-4 text-xs text-muted">Demo mode: pengiriman email belum aktif.</p>
        )}
      </div>
      <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} EduClass
      </p>
    </AuthLayout>
  );
}