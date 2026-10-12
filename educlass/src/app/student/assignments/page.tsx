import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listSubmissions } from "@/lib/data";
import { Btn, SectionHeading } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import { countdown, effectiveStatus, fmtDateTime, statusLabel } from "@/lib/utils";

export default async function StudentAssignments() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [assignments, courses, mySubmissions] = await Promise.all([
    listAssignments(),
    listCourses(),
    listSubmissions().then((subs) => subs.filter((s) => s.student_id === user.id)),
  ]);

  const all = assignments
    .map((a) => ({ a, eff: effectiveStatus(a) }))
    .sort((x, y) => new Date(x.a.deadline).getTime() - new Date(y.a.deadline).getTime());

  const visible = all.filter(({ eff }) => eff !== "draft");

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Tugas & Quiz</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Assignments.</h1>
        <p className="mt-3 text-muted">Kerjakan, kumpulkan, dan pantau nilaimu.</p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Semua Tugas" sub="Tersedia untukmu" />
        <div className="divide-y divide-line">
          {visible.length === 0 ? (
            <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
              Belum ada tugas yang dipublikasikan.
            </p>
          ) : (
            visible.map(({ a, eff }) => {
              const course = courses.find((c) => c.id === a.course_id);
              const sub = mySubmissions.find((s) => s.assignment_id === a.id);
              const open = eff === "active" || eff === "scheduled";
              return (
                <div key={a.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{course?.code}</p>
                    <h3 className="mt-1 font-serif text-xl">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      Mulai {fmtDateTime(a.start_time)} · Tenggat {fmtDateTime(a.deadline)}
                      {open ? ` · ${countdown(a.deadline)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {sub ? (
                      <span className="text-xs uppercase tracking-widest text-muted">
                        {sub.total_score !== null ? `Nilai ${sub.total_score}` : "Sudah dikumpulkan"}
                      </span>
                    ) : (
                      <StatusBadge status={eff} label={statusLabel(eff)} />
                    )}
                    <Btn
                      href={`/student/assignments/${a.id}`}
                      className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
                    >
                      {sub ? "Lihat" : eff === "active" ? "Kerjakan" : "Lihat"} →
                    </Btn>
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