import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listAssignments, listCourses, listMaterials } from "@/lib/data";

export default async function StudentCourses() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const courses = await listCourses();
  const materials = await listMaterials();
  const assignments = await listAssignments();

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Mata Kuliah</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">All Courses.</h1>
        <p className="mt-3 text-muted">Jelajahi materi dan tugas setiap mata kuliah.</p>
      </header>

      <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
        {courses.map((c, i) => {
          const materi = materials.filter((m) => m.course_id === c.id).length;
          const tugas = assignments.filter((a) => a.course_id === c.id).length;
          return (
            <Link
              key={c.id}
              href={`/student/courses/${c.id}`}
              className="group bg-background p-8 transition-colors hover:bg-panel"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                {String(i + 1).padStart(2, "0")} — {c.code}
              </p>
              <h2 className="mt-4 font-serif text-2xl leading-snug">{c.name}</h2>
              <p className="mt-3 text-sm text-muted">{c.description}</p>
              <p className="mt-8 text-xs text-muted">
                <span className="font-medium text-foreground">{materi}</span> Materi ·{" "}
                <span className="font-medium text-foreground">{tugas}</span> Tugas
              </p>
              <p className="mt-4 inline-block text-sm text-foreground">
                Buka <span aria-hidden>→</span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}