import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listCourses, createAssignment as insertAssignment } from "@/lib/data";
import type { AnswerMethod } from "@/lib/types";
import { checkUpload, putFile } from "@/lib/storage";
import { AssignmentCreateForm } from "./form";


async function createAssignment(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const start = String(formData.get("start") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const status = String(formData.get("status") ?? "") === "draft" ? "draft" : "";
  const questionsJson = String(formData.get("questions") ?? "");

  if (!title || !courseId || !start || !deadline) return;

  let requirement: { requirement_path: string; requirement_name: string } | null = null;
  const file = formData.get("requirement");
  if (file instanceof File && file.size > 0) {
    if (checkUpload(file)) return;
    const path = `materials/requirements/${courseId}/${Date.now()}-${file.name}`;
    await putFile(path, Buffer.from(await file.arrayBuffer()), file.name, file.type);
    requirement = { requirement_path: path, requirement_name: file.name };
  }

  const questions = JSON.parse(questionsJson) as {
    type: "multiple_choice" | "essay";
    question: string;
    score: number;
    answer_method?: string;
    options: { text: string; key: string; is_correct: boolean }[];
  }[];

  const created = await insertAssignment({
    assignment: {
      course_id: courseId,
      title,
      description,
      start_time: new Date(start).toISOString(),
      deadline: new Date(deadline).toISOString(),
      status,
      created_by: user.id,
      // kolom requirement_* hanya dikirim bila ada file: DEFAULT NULL berlaku di DB
      ...(requirement ?? {}),
    },
    questions: questions
      .filter((q) => q.question.trim())
      .map((q, i) => ({
        question_text: q.question.trim(),
        question_type: q.type,
        answer_method: (q.type === "essay" ? q.answer_method : "text") as AnswerMethod,
        score: q.score,
        order_number: i + 1,
        options:
          q.type === "multiple_choice" && Array.isArray(q.options)
            ? q.options
                .filter((o) => o.text.trim())
                .map((o) => ({ option_key: o.key, option_text: o.text.trim(), is_correct: o.is_correct }))
            : [],
      })),
  });

  redirect(`/admin/assignments/${created.id}`);
}

export default async function AdminAssignmentCreate() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const courses = await listCourses();

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Manajemen</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Buat Tugas.</h1>
        <p className="mt-3 text-muted">Atur jadwal, status, dan soal-soal.</p>
      </header>

      <AssignmentCreateForm
        courses={courses.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
        action={createAssignment}
      />
    </div>
  );
}