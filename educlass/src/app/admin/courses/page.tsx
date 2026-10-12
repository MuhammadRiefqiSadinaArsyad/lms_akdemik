import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  listCourses,
  listMaterials,
  listAssignments,
  getCourse,
  createCourse as insertCourse,
  updateCourse as patchCourse,
  deleteCourse as removeCourse,
} from "@/lib/data";
import { deleteFile } from "@/lib/storage";
import { Btn, Field, SectionHeading, TextInput } from "@/components/ui";

async function saveCourse(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim();
  if (!name || !code) return;
  const id = String(formData.get("id") ?? "");
  if (id) await patchCourse(id, { name, code, description });
  else await insertCourse({ name, code, description, created_by: user.id });
  redirect("/admin/courses");
}

/** hapus permanen — konfirmasi ketik ulang kode agar tidak salah klik */
async function deleteCourse(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const course = await getCourse(id);
  if (!course) return;
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== course.code) return;
  for (const m of await listMaterials(id)) await deleteFile(m.file_path);
  await removeCourse(id);
  redirect("/admin/courses");
}

export default async function AdminCourses() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const [courses, materials, assignments] = await Promise.all([
    listCourses(),
    listMaterials(),
    listAssignments(),
  ]);

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">Courses.</h1>
        <p className="mt-3 text-muted">Kelola mata kuliah dan materinya.</p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Tambah Mata Kuliah" sub="Form" />
        <form action={saveCourse} className="max-w-2xl space-y-6">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <Field label="Nama mata kuliah" htmlFor="name">
              <TextInput id="name" name="name" placeholder="Contoh: Pemrograman Web" required />
            </Field>
            <Field label="Kode" htmlFor="code">
              <TextInput id="code" name="code" placeholder="IF203" className="w-36" required />
            </Field>
          </div>
          <Field label="Deskripsi" htmlFor="description">
            <TextInput id="description" name="description" placeholder="Deskripsi singkat…" />
          </Field>
          <Btn type="submit" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
            + Tambahkan Mata Kuliah
          </Btn>
        </form>
      </section>

      <section className="mt-16">
        <SectionHeading index="02" title="Daftar Mata Kuliah" sub={`${courses.length} mata kuliah`} />
        <div className="divide-y divide-line">
          {courses.map((c, i) => {
            const materi = materials.filter((m) => m.course_id === c.id).length;
            const tugas = assignments.filter((a) => a.course_id === c.id).length;
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="flex items-baseline gap-5">
                  <span className="font-serif text-2xl text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-lg">
                      {c.name} <span className="text-sm text-muted">· {c.code}</span>
                    </h3>
                    <p className="mt-1 text-sm text-muted">{c.description}</p>
                    <p className="mt-2 text-xs text-muted">
                      {materi} materi · {tugas} tugas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="u-link text-sm font-medium"
                  >
                    Kelola →
                  </Link>
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                      Ubah
                    </summary>
                    <form action={saveCourse} className="absolute right-0 z-10 mt-4 w-80 space-y-4 border border-line bg-panel p-5">
                      <input type="hidden" name="id" value={c.id} />
                      <Field label="Nama mata kuliah" htmlFor={`name-${c.id}`}>
                        <TextInput id={`name-${c.id}`} name="name" defaultValue={c.name} required />
                      </Field>
                      <Field label="Kode" htmlFor={`code-${c.id}`}>
                        <TextInput id={`code-${c.id}`} name="code" defaultValue={c.code} className="w-36" required />
                      </Field>
                      <Field label="Deskripsi" htmlFor={`description-${c.id}`}>
                        <TextInput id={`description-${c.id}`} name="description" defaultValue={c.description} />
                      </Field>
                      <Btn type="submit">Simpan</Btn>
                    </form>
                  </details>
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                      Hapus
                    </summary>
                    <form action={deleteCourse} className="absolute right-0 z-10 mt-4 w-80 space-y-4 border border-line bg-panel p-5">
                      <input type="hidden" name="id" value={c.id} />
                      <p className="text-sm">
                        Hapus <span className="font-serif">{c.name}</span> beserta {materi} materi dan {tugas} tugasnya. Ketik kode <span className="font-medium">{c.code}</span> untuk konfirmasi.
                      </p>
                      <TextInput name="confirm" placeholder={c.code} required />
                      <Btn type="submit" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
                        Hapus permanen
                      </Btn>
                    </form>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}