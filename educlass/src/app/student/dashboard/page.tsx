import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listMaterials, listSubmissions } from "@/lib/data";
import {
  countdown,
  effectiveStatus,
  fmtDateTime,
  greeting,
  statusLabel,
} from "@/lib/utils";
import { Btn, SectionHeading, Stat, StatusBadge } from "@/components/ui";

export default async function StudentDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [courses, materials, allAssignments, allSubmissions] = await Promise.all([
    listCourses(),
    listMaterials(),
    listAssignments(),
    listSubmissions(),
  ]);
  const materialsCount = materials.length;
  const submissions = allSubmissions.filter((s) => s.student_id === user.id);
  const graded = submissions.filter((s) => s.total_score !== null);
  const assignments = allAssignments
    .map((a) => ({ a, eff: effectiveStatus(a) }))
    .filter(({ eff }) => eff === "active" || eff === "scheduled")
    .sort((x, y) => new Date(x.a.deadline).getTime() - new Date(y.a.deadline).getTime());

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {greeting()}, {user.name.split(" ")[0]}.
        </h1>
        <p className="mt-3 text-muted">Continue your learning journey.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 border-b border-line py-8 sm:gap-4 sm:py-10 lg:grid-cols-4">
        <Stat value={String(courses.length)} label="Mata Kuliah" />
        <Stat value={String(materialsCount)} label="Materi" />
        <Stat value={String(submissions.length)} label="Tugas Terkumpul" />
        <Stat value={graded.length > 0 ? String(graded[0].total_score) : "—"} label="Nilai Terakhir" />
      </section>

      <section className="py-14">
        <SectionHeading
          index="01"
          title="Your Courses"
          sub="Mata Kuliah"
          action={
            <Link
              href="/student/courses"
              className="u-link text-sm text-muted hover:text-foreground"
            >
              Lihat semua →
            </Link>
          }
        />
        <div className="grid gap-px bg-line md:grid-cols-2">
          {courses.map((c) => {
            const materi = materials.filter((m) => m.course_id === c.id).length;
            const tugas = allAssignments.filter((a) => a.course_id === c.id).length;
            return (
              <Link
                key={c.id}
                href={`/student/courses/${c.id}`}
                className="group min-w-0 bg-background p-6 transition-colors hover:bg-panel sm:p-8"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{c.code}</p>
                <h3 className="mt-3 font-serif text-2xl leading-snug">{c.name}</h3>
                <p className="mt-3 text-sm text-muted">{c.description}</p>
                <p className="mt-8 text-xs text-muted">
                  <span className="font-medium text-foreground">{materi}</span> Materi ·{" "}
                  <span className="font-medium text-foreground">{tugas}</span> Tugas
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-4">
        <SectionHeading
          index="02"
          title="Active Assignments"
          sub="Tugas & Quiz"
          action={
            <Link
              href="/student/assignments"
              className="u-link text-sm text-muted hover:text-foreground"
            >
              Lihat semua →
            </Link>
          }
        />
        {assignments.length === 0 ? (
          <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
            Tidak ada tugas aktif saat ini.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {assignments.map(({ a, eff }) => {
              const course = courses.find((c) => c.id === a.course_id);
              const sub = submissions.find((s) => s.assignment_id === a.id);
              return (
                <div key={a.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{course?.code}</p>
                    <h3 className="mt-1 font-serif text-xl">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      Tenggat {fmtDateTime(a.deadline)} · {countdown(a.deadline)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {sub ? (
                      <span className="text-xs uppercase tracking-widest text-muted">Sudah dikumpulkan</span>
                    ) : (
                      <StatusBadge status={eff} label={statusLabel(eff)} />
                    )}
                    <Btn href={`/student/assignments/${a.id}`} size="sm" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
                      {sub ? "Lihat" : eff === "active" ? "Kerjakan" : "Lihat"} →
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}