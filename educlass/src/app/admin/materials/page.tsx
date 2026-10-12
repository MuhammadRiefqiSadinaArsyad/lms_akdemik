import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listCourses, listMaterials, createMaterial } from "@/lib/data";
import { putFile, checkUpload } from "@/lib/storage";
import { Btn, Field, SectionHeading, TextInput } from "@/components/ui";
import { formatSize } from "@/lib/utils";

async function uploadMaterial(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file");
  if (!courseId || !title || !(file instanceof File) || !file.name) return;
  const invalid = checkUpload(file);
  if (invalid) return;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `materials/${courseId}/${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await putFile(path, bytes, file.name, file.type);

  await createMaterial({
    course_id: courseId,
    title,
    description,
    file_path: path,
    file_name: file.name,
    file_type: file.type || "application/pdf",
    file_size: file.size,
    created_by: user.id,
  });
  redirect(`/admin/courses/${courseId}`);
}

/** Upload materi sekaligus mencatat identitas dosen dari session */
export default async function AdminMaterials() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const [courses, materials] = await Promise.all([listCourses(), listMaterials()]);
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Materials.</h1>
        <p className="mt-3 text-muted">Unggah materi PDF untuk tiap mata kuliah.</p>
      </header>

      <section className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading index="01" title="Upload Materi" sub="Form" />
          <form action={uploadMaterial} className="space-y-6">
            <Field label="Mata kuliah" htmlFor="courseId">
              <select
                id="courseId"
                name="courseId"
                required
                className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Judul materi" htmlFor="title">
              <TextInput id="title" name="title" placeholder="Contoh: Pertemuan 5 - Flexbox" required />
            </Field>
            <Field label="Deskripsi" htmlFor="description">
              <TextInput id="description" name="description" placeholder="Deskripsi singkat…" />
            </Field>
            <Field label="File PDF" htmlFor="file">
              <input
                id="file"
                name="file"
                type="file"
                accept="application/pdf,.pdf"
                required
                className="block w-full border border-dashed border-line-strong bg-panel px-4 py-6 text-sm file:mr-4 file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-background"
              />
              <p className="mt-2 text-xs text-muted">PDF maksimal 10 MB.</p>
            </Field>
            <Btn type="submit" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
              Unggah Materi →
            </Btn>
          </form>
        </div>

        <div>
          <SectionHeading index="02" title="Materi Terunggah" sub="Semua" />
          <div className="divide-y divide-line">
            {materials.length === 0 ? (
              <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
                Belum ada materi.
              </p>
            ) : (
              [...materials]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((m) => {
                  const course = courseById.get(m.course_id);
                  return (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                          {course?.code} — {course?.name}
                        </p>
                        <h3 className="mt-1 font-serif text-lg">{m.title}</h3>
                        <p className="mt-1 text-xs text-muted">
                          {m.file_name} · {formatSize(m.file_size)}
                        </p>
                      </div>
                      <a
                        href={`/api/files?path=${encodeURIComponent(m.file_path)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="u-link text-sm font-medium"
                      >
                        Buka
                      </a>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}