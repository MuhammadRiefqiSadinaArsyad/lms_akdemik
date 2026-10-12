import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listSubmissions } from "@/lib/data";
import { fmtDateTime } from "@/lib/utils";
import { Btn, Empty, Stat } from "@/components/ui";

export default async function StudentResults() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [submissions, assignments, courses] = await Promise.all([
    listSubmissions(),
    listAssignments(),
    listCourses(),
  ]);

  const rows = submissions
    .filter((s) => s.student_id === user.id && s.total_score !== null)
    .map((s) => ({
      s,
      a: assignments.find((a) => a.id === s.assignment_id)!,
      course: courses.find((c) => c.id === (assignments.find((a) => a.id === s.assignment_id)?.course_id ?? ""))!,
    }))
    .sort((x, y) => new Date(y.s.submitted_at).getTime() - new Date(x.s.submitted_at).getTime());

  const avg =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + (r.s.total_score ?? 0), 0) / rows.length)
      : null;

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Nilai</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">Your Results.</h1>
        <p className="mt-3 text-muted">Pantau nilai dan feedback dari dosen.</p>
      </header>

      <section className="flex flex-wrap items-end gap-16 border-b border-line py-10">
        <Stat value={String(rows.length)} label="Tugas Dinilai" />
        {avg !== null && <Stat value={String(avg)} label="Rata-rata Nilai" />}
      </section>

      <section className="mt-12">
        {rows.length === 0 ? (
          <Empty title="Belum ada nilai" desc="Nilai akan muncul setelah dosen memeriksa jawabanmu." />
        ) : (
          <div className="divide-y divide-line">
            {rows.map(({ s, a, course }) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{course?.code}</p>
                  <h3 className="mt-1 font-serif text-xl">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">Dikumpulkan {fmtDateTime(s.submitted_at)}</p>
                </div>
                <div className="flex items-baseline gap-8">
                  <p className="font-serif text-4xl">{s.total_score}</p>
                  <Btn
                    href={`/student/assignments/${a.id}`}
                    className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
                  >
                    Lihat Hasil →
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 border-t border-line pt-10">
        <p className="text-sm text-muted">
          Feedback dosen untuk setiap tugas dapat dilihat pada halaman tugas masing-masing.
        </p>
      </section>
    </div>
  );
}