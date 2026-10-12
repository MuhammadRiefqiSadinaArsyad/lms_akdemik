import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listProfiles, listSubmissions } from "@/lib/data";
import { SectionHeading, Table, Td, StatusBadge, Empty } from "@/components/ui";
import { effectiveStatus, statusLabel } from "@/lib/utils";

export default async function AdminSubmissions() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [submissions, profiles, assignments, courses] = await Promise.all([
    listSubmissions(),
    listProfiles(),
    listAssignments(),
    listCourses(),
  ]);

  const rows = submissions
    .map((s) => ({
      s,
      student: profiles.find((p) => p.id === s.student_id),
      assignment: assignments.find((a) => a.id === s.assignment_id),
    }))
    .sort((a, b) => new Date(b.s.submitted_at).getTime() - new Date(a.s.submitted_at).getTime());

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">Pengumpulan.</h1>
        <p className="mt-3 text-muted">Periksa dan nilai jawaban mahasiswa.</p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Semua Pengumpulan" sub={`${rows.length} total`} />
        {rows.length === 0 ? (
          <Empty title="Belum ada pengumpulan" desc="Jawaban siswa akan muncul di sini." />
        ) : (
          <Table heads={["Siswa", "Tugas", "Waktu", "Status", "Nilai", ""]}>
            {rows.map(({ s, student, assignment }) => {
              const eff = assignment ? effectiveStatus(assignment) : "closed";
              return (
                <tr key={s.id}>
                  <Td>
                    <p className="font-medium">{student?.name}</p>
                    <p className="text-xs text-muted">{student?.nim}</p>
                  </Td>
                  <Td>
                    <p>{assignment?.title}</p>
                    <p className="text-xs text-muted">
                      {courses.find((c) => c.id === assignment?.course_id)?.code}
                    </p>
                  </Td>
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
                      <StatusBadge status="graded" label="Dinilai" />
                    ) : (
                      <StatusBadge status="active" label="Belum Dinilai" />
                    )}
                  </Td>
                  <Td className="font-serif text-lg">{s.total_score ?? "—"}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="u-link text-sm font-medium"
                    >
                      {s.total_score !== null ? "Lihat" : "Nilai"} →
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>
    </div>
  );
}