import { redirect } from "next/navigation";
import { getSessionUser, registerStudent } from "@/lib/auth";
import { deleteAccount, listProfiles, setPassword, updateProfile } from "@/lib/data";
import { Btn, Field, SectionHeading, Table, Td, TextInput, Empty } from "@/components/ui";

async function addStudent(formData: FormData) {
  "use server";
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return;
  const name = String(formData.get("name") ?? "").trim();
  const nim = String(formData.get("nim") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !nim || !email || password.length < 6) return;
  const res = await registerStudent({ name, nim, email, password });
  if ("error" in res) return;
  redirect("/admin/students");
}

async function editStudent(formData: FormData) {
  "use server";
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const nim = String(formData.get("nim") ?? "").trim();
  if (!id || !name || !nim) return;
  const clash = (await listProfiles("student")).find((s) => s.nim === nim && s.id !== id);
  if (clash) return;
  await updateProfile(id, { name, nim });
  redirect("/admin/students");
}

async function resetStudentPassword(formData: FormData) {
  "use server";
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 6) return;
  await setPassword(id, password);
  redirect("/admin/students");
}

async function deleteStudent(formData: FormData) {
  "use server";
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const student = (await listProfiles("student")).find((s) => s.id === id);
  if (!student) return;
  if (String(formData.get("confirm") ?? "").trim() !== student.nim) return;
  await deleteAccount(id);
  redirect("/admin/students");
}

export default async function AdminStudents() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const students = (await listProfiles("student")).sort((a, b) =>
    (a.nim ?? "").localeCompare(b.nim ?? ""),
  );

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Students.</h1>
        <p className="mt-3 text-muted">Daftar mahasiswa terdaftar.</p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Tambah Siswa" sub="Buat akun" />
        <form action={addStudent} className="max-w-3xl space-y-6">
          <div className="grid gap-6 min-[560px]:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama" htmlFor="new-name">
              <TextInput id="new-name" name="name" placeholder="Nama lengkap" required />
            </Field>
            <Field label="NIM" htmlFor="new-nim">
              <TextInput id="new-nim" name="nim" placeholder="2301008" required />
            </Field>
            <Field label="Email" htmlFor="new-email">
              <TextInput id="new-email" name="email" type="email" placeholder="nama@student.educlass.id" required />
            </Field>
          </div>
          <Field label="Password sementara" htmlFor="new-password">
            <TextInput id="new-password" name="password" type="text" placeholder="Min. 6 karakter" required />
          </Field>
          <Btn
            type="submit"
            className="w-full border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background sm:w-auto"
          >
            + Tambahkan Siswa
          </Btn>
        </form>
      </section>

      <section className="mt-16">
        <SectionHeading index="02" title="Semua Siswa" sub={`${students.length} mahasiswa`} />
        {students.length === 0 ? (
          <Empty title="Belum ada siswa" />
        ) : (
          <Table heads={["Nama", "NIM", "Email", "Terdaftar", "Aksi"]}>
            {students.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium">{s.name}</Td>
                <Td>{s.nim}</Td>
                <Td className="text-muted">{s.email}</Td>
                <Td className="text-muted">
                  {new Date(s.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <details className="relative">
                      <summary className="cursor-pointer list-none text-xs text-muted hover:text-foreground">
                        Ubah
                      </summary>
                      <form action={editStudent} className="absolute left-0 z-10 mt-4 w-56 max-w-[calc(100vw-2rem)] space-y-3 border border-line bg-panel p-4 shadow-lg sm:left-auto sm:right-0 sm:w-64">
                        <input type="hidden" name="id" value={s.id} />
                        <TextInput name="name" defaultValue={s.name} aria-label="Nama" required />
                        <TextInput name="nim" defaultValue={s.nim ?? ""} aria-label="NIM" required />
                        <Btn type="submit">Simpan</Btn>
                      </form>
                    </details>
                    <details className="relative">
                      <summary className="cursor-pointer list-none text-xs text-muted hover:text-foreground">
                        Reset sandi
                      </summary>
                      <form action={resetStudentPassword} className="absolute left-0 z-10 mt-4 w-56 max-w-[calc(100vw-2rem)] space-y-3 border border-line bg-panel p-4 shadow-lg sm:left-auto sm:right-0 sm:w-64">
                        <input type="hidden" name="id" value={s.id} />
                        <TextInput name="password" type="text" placeholder="Password baru" required />
                        <Btn type="submit">Setel ulang</Btn>
                      </form>
                    </details>
                    <details className="relative">
                      <summary className="cursor-pointer list-none text-xs text-muted hover:text-foreground">
                        Hapus
                      </summary>
                      <form action={deleteStudent} className="absolute left-0 z-10 mt-4 w-56 max-w-[calc(100vw-2rem)] space-y-3 border border-line bg-panel p-4 shadow-lg sm:left-auto sm:right-0 sm:w-64">
                        <input type="hidden" name="id" value={s.id} />
                        <p className="text-xs">
                        Akun dan seluruh jawabannya dihapus permanen. Ketik NIM untuk konfirmasi.
                        </p>
                        <TextInput name="confirm" placeholder={s.nim ?? ""} required />
                        <Btn
                          type="submit"
                          className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
                        >
                          Hapus
                        </Btn>
                      </form>
                    </details>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}