import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listSubmissions } from "@/lib/data";
import { Btn, SectionHeading } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import {
  countdown,
  effectiveStatus,
  fmtDateTime,
  statusLabel,
} from "@/lib/utils";

export default async function AdminAssignments() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const assignments = await listAssignments();
  const courses = await listCourses();
  const submissions = await listSubmissions();

  const rows = assignments
    .map((a) => ({ a, eff: effectiveStatus(a) }))
    .sort((x, y) => new Date(y.a.created_at).getTime() - new Date(x.a.created_at).getTime());

  return (
    <div className="fade-up">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Assignments.</h1>
          <p className="mt-3 text-muted">Buat, kelola, dan pantau semua tugas.</p>
        </div>
        <Btn href="/admin/assignments/create" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
          + Buat Tugas
        </Btn>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Semua Tugas" sub={`${rows.length} tugas`} />
        <div className="divide-y divide-line">
          {rows.length === 0 ? (
            <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
              Belum ada tugas. Buat tugas pertama kamu.
            </p>
          ) : (
            rows.map(({ a, eff }) => {
              const course = courses.find((c) => c.id === a.course_id);
              const subs = submissions.filter((s) => s.assignment_id === a.id);
              const ungraded = subs.filter((s) => s.total_score === null).length;
              return (
                <div key={a.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{course?.code}</p>
                    <h3 className="mt-1 font-serif text-xl">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {fmtDateTime(a.deadline)} · {subs.length} pengumpulan
                      {ungraded > 0 && <span className="text-foreground"> · {ungraded} belum dinilai</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <StatusBadge status={eff} label={statusLabel(eff)} />
                    <Link href={`/admin/assignments/${a.id}`} className="u-link text-sm font-medium">
                      Kelola →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}