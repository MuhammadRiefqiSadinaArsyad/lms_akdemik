import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, login } from "@/lib/auth";
import { setPassword, updateProfile } from "@/lib/data";
import { Btn, Field, SectionHeading, TextInput } from "@/components/ui";

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
  // verifikasi password lama dulu: sesi aplikasi cuma cookie, bukan token Supabase
  const check = await login(user.email, current);
  if ("error" in check) return;
  await setPassword(user.id, next);
  redirect("/account");
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const home = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Akun</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">{user.name}.</h1>
        <p className="mt-3 text-muted">
          {user.email} {user.nim ? `· NIM ${user.nim}` : ""}
        </p>
      </header>

      <section className="mt-12 grid max-w-3xl gap-12 sm:grid-cols-2">
        <div>
          <SectionHeading index="01" title="Data Diri" sub="Profil" />
          <form action={saveProfile} className="mt-8 space-y-6">
            <Field label="Nama" htmlFor="name">
              <TextInput id="name" name="name" defaultValue={user.name} required />
            </Field>
            <Field label="Email" htmlFor="email">
              <TextInput id="email" value={user.email} readOnly disabled />
            </Field>
            {user.nim && (
              <Field label="NIM" htmlFor="nim">
                <TextInput id="nim" value={user.nim} readOnly disabled />
              </Field>
            )}
            <Btn type="submit">Simpan</Btn>
          </form>
        </div>

        <div>
          <SectionHeading index="02" title="Ganti Password" sub="Keamanan" />
          <form action={changePassword} className="mt-8 space-y-6">
            <Field label="Password sekarang" htmlFor="current">
              <TextInput id="current" name="current" type="password" autoComplete="current-password" required />
            </Field>
            <Field label="Password baru" htmlFor="next">
              <TextInput id="next" name="next" type="password" autoComplete="new-password" minLength={6} required />
            </Field>
            <Btn type="submit">Ganti Password</Btn>
          </form>
        </div>
      </section>

      <p className="mt-16 text-sm text-muted">
        <Link href={home} className="u-link font-medium text-foreground">
          ← Kembali ke dashboard
        </Link>
      </p>
    </div>
  );
}