import { AuthLayout, AuthBrand } from "@/components/AuthLayout";
import Link from "next/link";
import { Btn, Checkbox, Field, TextInput } from "@/components/ui";
import { login, setSession } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { GoogleCallback } from "./GoogleCallback";

async function googleLogin() {
  "use server";
  const supabase = getSupabase();
  if (!supabase) return;
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/login` },
  });
  if (data.url) redirect(data.url);
}

export default function LoginPage() {
  async function action(formData: FormData) {
    "use server";
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");
    const res = await login(identifier, password);
    if ("error" in res) return;

    await setSession(res.profile.id);
    redirect(res.profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  }

  return (
    <AuthLayout>
      <AuthBrand />
      <div>
        <h1 className="font-serif text-5xl leading-tight xl:text-6xl">Welcome back.</h1>
        <p className="mt-3 text-sm text-muted">Masuk untuk melanjutkan pembelajaranmu.</p>

        <form action={action} className="mt-12 max-w-md space-y-7">
          <Field label="Email / NIM" htmlFor="identifier">
            <TextInput
              id="identifier"
              name="identifier"
              placeholder="Masukkan email atau NIM"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </Field>

          <div className="flex items-center justify-between gap-4">
            <Checkbox label="Ingat saya" name="remember" defaultChecked />
            <Link href="/forgot-password" className="u-link text-xs text-muted hover:text-foreground">
              Lupa password?
            </Link>
          </div>

          <Btn type="submit" className="w-full">Masuk <span aria-hidden>→</span></Btn>
        </form>

        <div className="mt-10 flex max-w-md items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-muted">
          <span className="h-px flex-1 bg-line" aria-hidden />
          ATAU
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <form action={googleLogin}>
          <button
            type="submit"
            className="mt-6 flex w-full max-w-md items-center justify-center gap-2 border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
          >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.4c-.1 1.1-.8 2.7-2.4 3.8l-.2.2 3.5 2.7.2.2c2.2-2 3.5-5 3.5-8.8z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-4.9l-.2.1-3.6 2.7-.1.2C3.9 21.2 7.6 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.5c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3v-.2L1.7 6.9l-.2.1C.6 8.5 0 10.2 0 12.2s.6 3.7 1.5 5.2l3.8-2.9z"
            />
            <path
              fill="#EA4335"
              d="M12 4.9c2.2 0 3.7 1 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.6 0 3.9 2.8 2.3 6.9l3.8 2.9c.9-2.8 3.6-4.9 6.7-4.9z"
            />
          </svg>
          Masuk dengan Google
        </button>
        </form>
        <GoogleCallback />

        <p className="mt-10 text-sm text-muted">
          Belum punya akun?{" "}
          <a href="/register" className="u-link font-medium text-foreground">
            Daftar di sini →
          </a>
        </p>
      </div>
      <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} EduClass
      </p>
    </AuthLayout>
  );
}