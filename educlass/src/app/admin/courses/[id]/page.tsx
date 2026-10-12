import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getAssignment,
  getCourse,
  listAnswers,
  listAssignments,
  listMaterials,
  listSubmissions,
  deleteMaterial as removeMaterial,
  deleteAssignment as removeAssignment,
} from "@/lib/data";
import { deleteFile } from "@/lib/storage";
import { Btn, Field, SectionHeading, TextInput } from "@/components/ui";
import { effectiveStatus, fmtDateTime, formatSize, statusLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

async function deleteMaterial(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const material = (await listMaterials()).find((m) => m.id === id);
  if (!material) return;
  if (String(formData.get("confirm") ?? "").trim() !== material.title) return;
  await deleteFile(material.file_path);
  await removeMaterial(id);
  redirect(`/admin/courses/${material.course_id}`);
}

async function deleteAssignment(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const assignment = await getAssignment(id);
  if (!assignment) return;
  if (String(formData.get("confirm") ?? "").trim() !== assignment.title) return;
  // file jawaban ikut dibersihkan supaya tidak tertinggal di storage
  for (const submission of await listSubmissions(id)) {
    for (const answer of await listAnswers(submission.id)) {
      if (answer.file_path) await deleteFile(answer.file_path);
    }
  }
  await removeAssignment(id);
  redirect(`/admin/courses/${assignment.course_id}`);
}

export default async function AdminCourseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const materials = await listMaterials(course.id);
  const assignments = (await listAssignments(course.id)).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{course.code}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{course.name}.</h1>
        <p className="mt-3 text-muted">{course.description}</p>
        <div className="mt-8 flex gap-4">
          <Btn
            href={`/admin/materials?courseId=${course.id}`}
            className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
          >
            + Upload Materi
          </Btn>
          <Btn
            href={`/admin/assignments/create?courseId=${course.id}`}
            className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
          >
            + Buat Tugas
          </Btn>
        </div>
      </header>

      <section className="py-12">
        <SectionHeading index="01" title="Materi" sub="Bahan Perkuliahan" />
        <div className="divide-y divide-line">
          {materials.length === 0 ? (
            <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
              Belum ada materi untuk mata kuliah ini.
            </p>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <h3 className="font-serif text-lg">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                  <p className="mt-1 text-xs text-muted">{m.file_name} · {formatSize(m.file_size)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`/api/files?path=${encodeURIComponent(m.file_path)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link text-sm font-medium"
                  >
                    Buka
                  </a>
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                      Hapus
                    </summary>
                    <form action={deleteMaterial} className="absolute right-0 z-10 mt-4 w-72 space-y-4 border border-line bg-panel p-5">
                      <input type="hidden" name="id" value={m.id} />
                      <p className="text-sm">Hapus materi ini? Ketik judulnya untuk konfirmasi.</p>
                      <TextInput name="confirm" placeholder={m.title} required />
                      <Btn type="submit" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
                        Hapus
                      </Btn>
                    </form>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="py-12">
        <SectionHeading index="02" title="Tugas" sub="Tugas & Quiz" />
        <div className="divide-y divide-line">
          {assignments.length === 0 ? (
            <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
              Belum ada tugas untuk mata kuliah ini.
            </p>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <h3 className="font-serif text-lg">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {fmtDateTime(a.start_time)} → {fmtDateTime(a.deadline)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={effectiveStatus(a)} label={statusLabel(effectiveStatus(a))} />
                  <Link href={`/admin/assignments/${a.id}`} className="u-link text-sm font-medium">
                    Kelola →
                  </Link>
                  <details className="relative">
                    <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                      Hapus
                    </summary>
                    <form action={deleteAssignment} className="absolute right-0 z-10 mt-4 w-72 space-y-4 border border-line bg-panel p-5">
                      <input type="hidden" name="id" value={a.id} />
                      <p className="text-sm">
                        Hapus tugas beserta soal dan seluruh jawaban siswa? Ketik judulnya untuk konfirmasi.
                      </p>
                      <TextInput name="confirm" placeholder={a.title} required />
                      <Btn type="submit" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
                        Hapus
                      </Btn>
                    </form>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}