import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAssignment, getCourse, listProfiles, listSubmissions } from "@/lib/data";
import { SectionHeading, Table, Td, StatusBadge, Empty } from "@/components/ui";

export default async function AdminAssignmentSubmissions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const [course, profiles, submissions] = await Promise.all([
    getCourse(assignment.course_id),
    listProfiles(),
    listSubmissions(id),
  ]);
  const rows = submissions
    .map((s) => ({ s, student: profiles.find((p) => p.id === s.student_id) }))
    .sort((a, b) => new Date(b.s.submitted_at).getTime() - new Date(a.s.submitted_at).getTime());

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {course?.code} — Pengumpulan
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{assignment.title}.</h1>
        <p className="mt-3 text-muted">Daftar jawaban yang masuk.</p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="Pengumpulan" sub={`${rows.length} jawaban`} />
        {rows.length === 0 ? (
          <Empty title="Belum ada pengumpulan" desc="Jawaban siswa untuk tugas ini akan muncul di sini." />
        ) : (
          <Table heads={["Siswa", "Waktu", "Status", "Nilai", ""]}>
            {rows.map(({ s, student }) => (
              <tr key={s.id}>
                <Td>
                  <p className="font-medium">{student?.name}</p>
                  <p className="text-xs text-muted">{student?.nim}</p>
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
            ))}
          </Table>
        )}
        <p className="mt-10">
          <Link href={`/admin/assignments/${id}`} className="u-link text-sm text-muted">
            ← Kembali ke detail tugas
          </Link>
        </p>
      </section>
    </div>
  );
}