import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, login } from "@/lib/auth";
import { setPassword, updateProfile } from "@/lib/data";
import { Avatar, Btn, Field, SectionHeading, TextInput } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await updateProfile(user.id, { name });
  redirect("/account");
}

async function changePassword(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 6) return;
  const check = await login(user.email, current);
  if ("error" in check) return;
  await setPassword(user.id, next);
  redirect("/account");
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const home = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
  const roleLabel = user.role === "admin" ? "Dosen · Admin" : "Mahasiswa";

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="fade-up">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={home}
            className="u-link min-w-0 truncate text-sm text-muted hover:text-foreground"
          >
            <span className="sm:hidden">← Kembali</span>
            <span className="hidden sm:inline">← Kembali ke dashboard</span>
          </Link>
          <span className="shrink-0 border border-line-strong px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted">
            {roleLabel}
          </span>
        </div>

        <header className="mt-10 flex items-start gap-5 border-b border-line pb-10 sm:items-center sm:gap-6">
          <Avatar name={user.name} size="lg" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Akun</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
              {user.name}.
            </h1>
            <p className="mt-2 break-words text-sm text-muted">
              {user.email}
              {user.nim ? (
                <>
                  {" · "}
                  <span className="whitespace-nowrap">NIM {user.nim}</span>
                </>
              ) : null}
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6">
          <section className="fade-up d-1 border border-line bg-panel p-6 shadow-[0_8px_24px_rgba(27,25,21,0.06)] sm:p-8">
            <SectionHeading index="01" title="Data Diri" sub="Profil" />
            <form action={saveProfile} className="space-y-6">
              <Field label="Nama" htmlFor="name">
                <TextInput id="name" name="name" defaultValue={user.name} required />
              </Field>
              <div className="grid gap-6 min-[480px]:grid-cols-2">
                <Field label="Email" htmlFor="email">
                  <TextInput id="email" value={user.email} readOnly disabled />
                </Field>
                {user.nim ? (
                  <Field label="NIM" htmlFor="nim">
                    <TextInput id="nim" value={user.nim} readOnly disabled />
                  </Field>
                ) : null}
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Email{user.nim ? " dan NIM " : " "}dikelola oleh admin — hubungi
                dosen atau bagian akademik bila perlu diubah.
              </p>
              <Btn type="submit" className="w-full sm:w-auto">
                Simpan Perubahan
              </Btn>
            </form>
          </section>

          <section className="fade-up d-2 border border-line bg-panel p-6 shadow-[0_8px_24px_rgba(27,25,21,0.06)] sm:p-8">
            <SectionHeading index="02" title="Ganti Password" sub="Keamanan" />
            <form action={changePassword} className="space-y-6">
              <Field label="Password sekarang" htmlFor="current">
                <PasswordInput
                  id="current"
                  name="current"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field
                label="Password baru"
                htmlFor="next"
                hint="Minimal 6 karakter."
              >
                <PasswordInput
                  id="next"
                  name="next"
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </Field>
              <Btn type="submit" className="w-full sm:w-auto">
                Ganti Password
              </Btn>
            </form>
          </section>
        </div>

        <p className="mt-10 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
          © {new Date().getFullYear()} EduClass
        </p>
      </div>
    </div>
  );
}
