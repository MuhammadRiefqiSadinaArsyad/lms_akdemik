import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getCourse, listAssignments, listMaterials, listSubmissions } from "@/lib/data";
import { Btn, SectionHeading } from "@/components/ui";
import { formatSize, effectiveStatus, statusLabel, fmtDateTime, countdown } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const materials = await listMaterials(id);
  const submissions = await listSubmissions();
  const assignments = (await listAssignments(id)).map((a) => ({ a, eff: effectiveStatus(a) }));

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{course.code}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{course.name}.</h1>
        <p className="mt-3 text-muted">{course.description}</p>
      </header>

      <section className="py-14">
        <SectionHeading index="01" title="Materi" sub="Bahan Perkuliahan" />
        <div className="divide-y divide-line">
          {materials.map((m, i) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="flex items-baseline gap-5">
                <span className="font-serif text-2xl text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-lg">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] uppercase tracking-wider text-muted">
                  PDF · {formatSize(m.file_size)}
                </span>
                <a
                  href={`/api/files?path=${encodeURIComponent(m.file_path)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="u-link text-sm font-medium"
                >
                  Buka PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-4">
        <SectionHeading index="02" title="Tugas" sub="Tugas & Quiz" />
        <div className="divide-y divide-line">
          {assignments.length === 0 ? (
            <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
              Belum ada tugas untuk mata kuliah ini.
            </p>
          ) : (
            assignments.map(({ a, eff }) => {
              const submitted = submissions.find(
                (s) => s.assignment_id === a.id && s.student_id === user.id,
              );
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
                  <div>
                    <h3 className="font-serif text-xl">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {fmtDateTime(a.deadline)}
                      {eff === "active" || eff === "scheduled" ? ` · ${countdown(a.deadline)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {submitted ? (
                      <span className="text-xs uppercase tracking-widest text-muted">Sudah dikumpulkan</span>
                    ) : (
                      <StatusBadge status={eff} label={statusLabel(eff)} />
                    )}
                    <Btn
                      href={`/student/assignments/${a.id}`}
                      className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
                    >
                      {submitted ? "Lihat" : "Kerjakan"} →
                    </Btn>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
      <p className="mt-16">
        <Link href="/student/courses" className="u-link text-sm text-muted">
          ← Kembali ke semua mata kuliah
        </Link>
      </p>
    </div>
  );
}