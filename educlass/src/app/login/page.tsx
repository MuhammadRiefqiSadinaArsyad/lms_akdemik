import { AuthLayout, AuthBrand } from "@/components/AuthLayout";
import Link from "next/link";
import { Btn, Checkbox, Field, TextInput } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { login, setSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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
      <div className="min-w-0">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl xl:text-6xl">Welcome back.</h1>
        <p className="mt-3 text-sm text-muted">Masuk untuk melanjutkan pembelajaranmu.</p>

        <form action={action} className="mt-8 w-full max-w-md space-y-7 sm:mt-12">
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
            <PasswordInput
              id="password"
              name="password"
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

        <div className="mt-10 w-full max-w-md border border-line bg-panel px-5 py-4 text-sm leading-relaxed text-muted">
          <p className="font-medium text-foreground">Belum punya akun?</p>
          <p className="mt-1">
            Akun mahasiswa dibuatkan oleh dosen / admin kampus. Silakan hubungi
            dosen atau bagian akademik untuk mendapatkan Email/NIM dan password.
          </p>
        </div>
      </div>
      <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} EduClass
      </p>
    </AuthLayout>
  );
}