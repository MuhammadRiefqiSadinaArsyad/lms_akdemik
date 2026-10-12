import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listProfiles, listSubmissions } from "@/lib/data";
import { effectiveStatus, greeting, statusLabel } from "@/lib/utils";
import { Btn, SectionHeading, Stat, StatusBadge, Table, Td } from "@/components/ui";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [profiles, courses, assignments, submissions] = await Promise.all([
    listProfiles(),
    listCourses(),
    listAssignments(),
    listSubmissions(),
  ]);

  const students = profiles.filter((p) => p.role === "student");
  const ungraded = submissions.filter((s) => s.total_score === null);
  const activeCount = assignments.filter((a) => effectiveStatus(a) === "active").length;

  const recentSubs = [...submissions]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 6);

  return (
    <div className="fade-up space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-[0_8px_24px_rgba(27,25,21,0.06)] sm:p-8 md:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-foreground/[0.04]" />
        <p className="relative text-[11px] uppercase tracking-[0.24em] text-muted">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="relative mt-3 font-serif text-4xl leading-tight sm:text-5xl">{greeting()}, Lecturer.</h1>
        <p className="relative mt-3 text-muted">Pantau materi, tugas, dan pengumpulan.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat value={String(students.length)} label="Students" />
        <Stat value={String(courses.length)} label="Courses" />
        <Stat value={String(assignments.length)} label="Assignments" />
        <Stat value={String(submissions.length)} label="Submissions" />
      </section>

      <section className="mt-14">
        <SectionHeading
          index="01"
          title="Perlu Dinilai"
          sub="Pengumpulan"
          action={
            <Link
              href="/admin/submissions"
              className="u-link text-sm text-muted hover:text-foreground"
            >
              Semua pengumpulan →
            </Link>
          }
        />
        {ungraded.length > 0 ? (
          <p className="mb-6 border border-foreground px-4 py-3 text-sm">
            {ungraded.length} jawaban belum dinilai.{" "}
            <Link href="/admin/submissions" className="u-link font-medium">
              Periksa sekarang →
            </Link>
          </p>
        ) : (
          <p className="mb-6 text-sm text-muted">Semua jawaban sudah dinilai.</p>
        )}

        {recentSubs.length === 0 ? (
          <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
            Belum ada pengumpulan.
          </p>
        ) : (
          <Table heads={["Siswa", "Tugas", "Waktu", "Status", "Nilai"]}>
            {recentSubs.map((s) => {
              const student = profiles.find((p) => p.id === s.student_id);
              const a = assignments.find((a) => a.id === s.assignment_id);
              return (
                <tr key={s.id}>
                  <Td>
                    <p className="font-medium">{student?.name}</p>
                    <p className="text-xs text-muted">{student?.nim}</p>
                  </Td>
                  <Td>{a?.title}</Td>
                  <Td className="text-muted">
                    {new Date(s.submitted_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td>
                    {s.total_score !== null ? (
                      <span className="text-xs uppercase tracking-widest">Dinilai</span>
                    ) : (
                      <StatusBadge status="active" label="Belum Dinilai" />
                    )}
                  </Td>
                  <Td className="font-serif text-lg">{s.total_score ?? "—"}</Td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>

      <section className="mt-16">
        <SectionHeading
          index="02"
          title="Tugas Aktif"
          sub="Status"
          action={
            <Btn href="/admin/assignments/create" className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
              + Buat Tugas
            </Btn>
          }
        />
        {activeCount === 0 ? (
          <p className="border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
            Tidak ada tugas aktif.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {assignments
              .filter((a) => effectiveStatus(a) === "active")
              .map((a) => {
                const course = courses.find((c) => c.id === a.course_id);
                return (
                  <div key={a.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{course?.code}</p>
                      <h3 className="font-serif text-lg">{a.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <StatusBadge status="active" label={statusLabel("active")} />
                      <Btn href={`/admin/assignments/${a.id}`} className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
                        Kelola →
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