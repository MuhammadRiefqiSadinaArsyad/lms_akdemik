import { AuthLayout, AuthBrand } from "@/components/AuthLayout";
import { Btn, Field, TextInput } from "@/components/ui";
import { registerStudent, setSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function action(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "");
    const nim = String(formData.get("nim") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const res = await registerStudent({ name, nim, email, password });
    if ("error" in res) return;

    await setSession(res.profile.id);
    redirect("/student/dashboard");
  }

  return (
    <AuthLayout>
      <AuthBrand compact />
      <div>
        <h1 className="font-serif text-5xl leading-tight xl:text-6xl">Create account.</h1>
        <p className="mt-3 text-sm text-muted">
          Daftar sebagai mahasiswa untuk mulai belajar.
        </p>

        <form action={action} className="mt-12 max-w-md space-y-7">
          <Field label="Nama lengkap" htmlFor="name">
            <TextInput id="name" name="name" placeholder="Nama lengkap" autoComplete="name" required />
          </Field>
          <Field label="NIM" htmlFor="nim">
            <TextInput id="nim" name="nim" placeholder="Nomor Induk Mahasiswa" autoComplete="off" required />
          </Field>
          <Field label="Email" htmlFor="email">
            <TextInput id="email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" required />
          </Field>
          <Field label="Password" htmlFor="password">
            <TextInput id="password" name="password" type="password" placeholder="Minimal 6 karakter" autoComplete="new-password" minLength={6} required />
          </Field>

          <Btn type="submit" className="w-full">Daftar <span aria-hidden>→</span></Btn>
        </form>

        <p className="mt-10 text-sm text-muted">
          Sudah punya akun?{" "}
          <a href="/login" className="u-link font-medium text-foreground">
            Masuk di sini →
          </a>
        </p>
      </div>
      <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} EduClass
      </p>
    </AuthLayout>
  );
}