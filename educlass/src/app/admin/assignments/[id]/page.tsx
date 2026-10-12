import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAssignment, getCourse, listQuestions, listQuestionOptions, listSubmissions, listProfiles, listLogs, updateAssignment, createQuestion, updateQuestion, replaceQuestionOptions, deleteQuestion as removeQuestion, logAction as writeLog } from "@/lib/data";
import { checkUpload, deleteFile, putFile } from "@/lib/storage";
import type { AnswerMethod, Assignment, Question } from "@/lib/types";
import { Btn, Field, SectionHeading, TextArea, TextInput } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import { effectiveStatus, fmtDateTime, statusLabel } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"];

async function logAction(
  assignmentId: string,
  action: string,
  oldValue: unknown,
  newValue: unknown,
  changedBy: string,
) {
  await writeLog({
    assignment_id: assignmentId,
    action,
    old_value: oldValue === undefined ? null : String(oldValue),
    new_value: newValue === undefined ? null : String(newValue),
    changed_by: changedBy,
  });
}

async function extendDeadline(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const id = String(formData.get("assignmentId") ?? "");
  const newDeadline = String(formData.get("newDeadline") ?? "");
  const assignment = await getAssignment(id);
  if (!assignment || !newDeadline) return;

  const deadline = new Date(newDeadline).toISOString();
  await updateAssignment(id, { deadline });
  await logAction(id, "extended_deadline", assignment.deadline, deadline, user.id);
  redirect(`/admin/assignments/${id}`);
}

async function pauseAssignment(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const id = String(formData.get("assignmentId") ?? "");
  const assignment = await getAssignment(id);
  if (!assignment) return;

  const oldValue = { status: assignment.status, deadline: assignment.deadline };
  await updateAssignment(id, { status: "paused" });
  await logAction(id, "paused", oldValue, { status: "paused" }, user.id);
  redirect(`/admin/assignments/${id}`);
}

async function reopenAssignment(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const id = String(formData.get("assignmentId") ?? "");
  const newDeadline = String(formData.get("reopenDeadline") ?? "");
  const assignment = await getAssignment(id);
  if (!assignment) return;

  const oldValue = { status: assignment.status, deadline: assignment.deadline };
  const deadline = newDeadline ? new Date(newDeadline).toISOString() : assignment.deadline;
  await updateAssignment(id, { status: "", deadline });
  await logAction(id, "reopened", oldValue, { status: "", deadline }, user.id);
  redirect(`/admin/assignments/${id}`);
}

async function editAssignment(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const assignment = await getAssignment(id);
  if (!assignment) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const start = String(formData.get("start") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const status = statusRaw === "draft" || statusRaw === "paused" ? statusRaw : "";
  if (!title || !start || !deadline) return;
  if (new Date(deadline).getTime() <= new Date(start).getTime()) return;

  const patch: Partial<Assignment> = {
    title,
    description,
    start_time: new Date(start).toISOString(),
    deadline: new Date(deadline).toISOString(),
    status,
  };

  const file = formData.get("requirement");
  if (file instanceof File && file.size > 0) {
    if (checkUpload(file)) return;
    const path = `materials/requirements/${assignment.course_id}/${Date.now()}-${file.name}`;
    await putFile(path, Buffer.from(await file.arrayBuffer()), file.name, file.type);
    if (assignment.requirement_path) await deleteFile(assignment.requirement_path);
    patch.requirement_path = path;
    patch.requirement_name = file.name;
  } else if (formData.get("removeRequirement") === "on" && assignment.requirement_path) {
    await deleteFile(assignment.requirement_path);
    patch.requirement_path = null;
    patch.requirement_name = null;
  }

  const oldValue = {
    title: assignment.title,
    description: assignment.description,
    start_time: assignment.start_time,
    deadline: assignment.deadline,
    status: assignment.status,
  };
  await updateAssignment(id, patch);
  await logAction(id, "updated", oldValue, patch, user.id);
  redirect(`/admin/assignments/${id}`);
}

async function saveQuestion(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return;

  const id = String(formData.get("id") ?? "");
  const questionText = String(formData.get("question") ?? "").trim();
  const score = Number(formData.get("score") ?? 0);
  const type = String(formData.get("type") ?? "") === "multiple_choice" ? "multiple_choice" : "essay";
  const methodRaw = String(formData.get("answerMethod") ?? "text");
  const answerMethod = (["text", "pdf", "text_and_pdf"] as const).find((m) => m === methodRaw) ?? "text";
  if (!questionText || !Number.isFinite(score) || score <= 0) return;

  const options = LETTERS.flatMap((key) => {
    const text = String(formData.get(`option-${key}`) ?? "").trim();
    return text ? [{ option_key: key, option_text: text, is_correct: formData.get(`correct-${key}`) === "on" }] : [];
  });
  if (type === "multiple_choice" && (options.length < 2 || !options.some((o) => o.is_correct))) return;

  if (id) {
    await updateQuestion(id, {
      question_text: questionText,
      score,
      answer_method: type === "essay" ? (answerMethod as AnswerMethod) : "text",
    });
    await replaceQuestionOptions(id, type === "multiple_choice" ? options : []);
    await logAction(assignmentId, "question_updated", { id }, { id, question: questionText }, user.id);
  } else {
    const existing = await listQuestions(assignmentId);
    const created = await createQuestion({
      assignment_id: assignmentId,
      question_text: questionText,
      question_type: type,
      answer_method: type === "essay" ? (answerMethod as AnswerMethod) : "text",
      score,
      order_number: existing.length + 1,
      options: type === "multiple_choice" ? options : [],
    });
    await logAction(assignmentId, "question_added", null, { id: created.id }, user.id);
  }
  redirect(`/admin/assignments/${assignmentId}`);
}

async function deleteQuestion(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return;
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const id = String(formData.get("id") ?? "");
  const question = (await listQuestions(assignmentId)).find((q) => q.id === id);
  if (!question) return;
  if (String(formData.get("confirm") ?? "").trim() !== question.question_text) return;
  await removeQuestion(id);
  await logAction(assignmentId, "question_deleted", { id, text: question.question_text }, null, user.id);
  redirect(`/admin/assignments/${assignmentId}`);
}

const inputCls =
  "w-full border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none";

function QuestionFields({
  assignmentId,
  question,
  options,
  submitLabel,
}: {
  assignmentId: string;
  question: Question | null;
  options: { option_key: string; option_text: string; is_correct: boolean }[];
  submitLabel: string;
}) {
  return (
    <form action={saveQuestion} className="mt-4 space-y-4 border border-line p-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {question && <input type="hidden" name="id" value={question.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <select name="type" defaultValue={question?.question_type ?? "multiple_choice"} className={inputCls}>
          <option value="multiple_choice">Pilihan Ganda</option>
          <option value="essay">Essay</option>
        </select>
        <input
          type="number"
          name="score"
          min={1}
          defaultValue={question?.score ?? 10}
          className="w-24 border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
          aria-label="Skor"
        />
        <select name="answerMethod" defaultValue={question?.answer_method ?? "text"} className={inputCls}>
          <option value="text">Jawaban teks</option>
          <option value="pdf">Upload PDF</option>
          <option value="text_and_pdf">Teks dan/atau PDF</option>
        </select>
      </div>
      <TextArea
        name="question"
        rows={3}
        defaultValue={question?.question_text ?? ""}
        placeholder="Teks pertanyaan…"
        required
      />
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Pilihan (dipakai bila Pilihan Ganda)</p>
      {LETTERS.map((key) => {
        const opt = options.find((o) => o.option_key === key);
        return (
          <div key={key} className="flex items-center gap-3">
            <input
              type="checkbox"
              name={`correct-${key}`}
              defaultChecked={opt?.is_correct ?? false}
              className="h-4 w-4 appearance-none border border-line-strong bg-panel checked:border-foreground checked:bg-foreground"
              aria-label={`Kunci jawaban ${key}`}
            />
            <span className="w-4 text-xs text-muted">{key}</span>
            <TextInput name={`option-${key}`} defaultValue={opt?.option_text ?? ""} placeholder={`Pilihan ${key}`} className="flex-1" />
          </div>
        );
      })}
      <Btn type="submit">{submitLabel}</Btn>
    </form>
  );
}

export default async function AdminAssignmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const [course, questions, submissions, logs, profiles] = await Promise.all([
    getCourse(assignment.course_id),
    listQuestions(id),
    listSubmissions(id),
    listLogs(id),
    listProfiles(),
  ]);
  const options = await listQuestionOptions(questions.map((q) => q.id));
  const eff = effectiveStatus(assignment);
  const ungraded = submissions.filter((s) => s.total_score === null).length;

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {course?.code} — Tugas
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">{assignment.title}.</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{assignment.description}</p>
        <dl className="mt-8 grid max-w-lg grid-cols-2 gap-x-10 gap-y-4 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">Mulai</dt>
            <dd className="mt-1 font-medium">{fmtDateTime(assignment.start_time)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">Deadline</dt>
            <dd className="mt-1 font-medium">{fmtDateTime(assignment.deadline)}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <StatusBadge status={eff} label={statusLabel(eff)} />
        </div>
        {assignment.requirement_path && (
          <p className="mt-4 text-sm">
            Lampiran:{" "}
            <a
              href={`/api/files?path=${encodeURIComponent(assignment.requirement_path)}`}
              target="_blank"
              rel="noreferrer"
              className="u-link font-medium"
            >
              {assignment.requirement_name ?? "soal.pdf"}
            </a>
          </p>
        )}
        <details className="mt-8 max-w-2xl">
          <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
            Ubah tugas
          </summary>
          <form action={editAssignment} className="mt-6 space-y-5 border border-line p-6">
            <input type="hidden" name="id" value={id} />
            <Field label="Judul tugas" htmlFor="edit-title">
              <TextInput id="edit-title" name="title" defaultValue={assignment.title} required />
            </Field>
            <Field label="Deskripsi" htmlFor="edit-description">
              <TextArea id="edit-description" name="description" rows={3} defaultValue={assignment.description} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Mulai" htmlFor="edit-start">
                <input
                  id="edit-start"
                  name="start"
                  type="datetime-local"
                  defaultValue={assignment.start_time.slice(0, 16)}
                  required
                  className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
                />
              </Field>
              <Field label="Deadline" htmlFor="edit-deadline">
                <input
                  id="edit-deadline"
                  name="deadline"
                  type="datetime-local"
                  defaultValue={assignment.deadline.slice(0, 16)}
                  required
                  className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
                />
              </Field>
            </div>
            <Field label="Status" htmlFor="edit-status">
              <select
                id="edit-status"
                name="status"
                defaultValue={assignment.status}
                className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
              >
                <option value="">Ikuti jadwal</option>
                <option value="draft">Draft (disembunyikan)</option>
                <option value="paused">Ditunda</option>
              </select>
            </Field>
            <Field label="Ganti lampiran (PDF, opsional)" htmlFor="edit-requirement">
              <input
                id="edit-requirement"
                name="requirement"
                type="file"
                accept="application/pdf"
                className="w-full text-sm file:mr-4 file:border file:border-line-strong file:px-4 file:py-2 file:text-sm"
              />
            </Field>
            {assignment.requirement_path && (
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="removeRequirement"
                  className="h-4 w-4 appearance-none border border-line-strong bg-panel checked:border-foreground checked:bg-foreground"
                />
                Hapus lampiran lama
              </label>
            )}
            <Btn type="submit">Simpan Perubahan</Btn>
          </form>
        </details>
      </header>

      <section className="py-12">
        <SectionHeading
          index="01"
          title="Pengumpulan"
          sub={`${submissions.length} total`}
          action={
            <Link href={`/admin/assignments/${id}/submissions`} className="u-link text-sm text-muted">
              Lihat semua →
            </Link>
          }
        />
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-background p-6">
            <p className="font-serif text-4xl">{submissions.length}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">Total</p>
          </div>
          <div className="bg-background p-6">
            <p className="font-serif text-4xl">{submissions.length - ungraded}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">Dinilai</p>
          </div>
          <div className="bg-background p-6">
            <p className="font-serif text-4xl">{ungraded}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">Belum Dinilai</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <SectionHeading index="02" title="Manajemen Waktu" sub="Time Management" />
        <div className="grid gap-6 md:grid-cols-3">
          <form action={extendDeadline} className="border border-line p-6">
            <input type="hidden" name="assignmentId" value={id} />
            <p className="font-serif text-lg">Perpanjang Deadline</p>
            <p className="mt-1 text-xs text-muted">Berikan waktu tambahan untuk siswa.</p>
            <input
              type="datetime-local"
              name="newDeadline"
              required
              className="mt-4 w-full border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
            />
            <Btn type="submit" className="mt-4 border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
              Perpanjang →
            </Btn>
          </form>

          <form action={pauseAssignment} className="border border-line p-6">
            <input type="hidden" name="assignmentId" value={id} />
            <p className="font-serif text-lg">Tunda Tugas</p>
            <p className="mt-1 text-xs text-muted">
              {assignment.status === "paused" ? "Tugas sedang ditunda." : "Hentikan pengumpulan sementara."}
            </p>
            <Btn
              type="submit"
              disabled={assignment.status === "paused"}
              className="mt-4 border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              {assignment.status === "paused" ? "Sedang Ditunda" : "Tunda Sekarang →"}
            </Btn>
          </form>

          <form action={reopenAssignment} className="border border-line p-6">
            <input type="hidden" name="assignmentId" value={id} />
            <p className="font-serif text-lg">Buka Kembali</p>
            <p className="mt-1 text-xs text-muted">Aktifkan kembali pengumpulan.</p>
            <input
              type="datetime-local"
              name="reopenDeadline"
              className="mt-4 w-full border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
            />
            <Btn type="submit" className="mt-4 border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background">
              Aktifkan Kembali →
            </Btn>
          </form>
        </div>
      </section>

      <section className="py-12">
        <SectionHeading index="03" title="Susunan Soal" sub="Pertanyaan" />
        <div className="divide-y divide-line">
          {questions.map((q, i) => {
            const opts = options.filter((o) => o.question_id === q.id);
            return (
              <div key={q.id} className="py-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Soal {String(i + 1).padStart(2, "0")} · {q.score} poin ·{" "}
                  {q.question_type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
                </p>
                <p className="mt-2 font-serif text-lg">{q.question_text}</p>
                {opts.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {opts.map((o) => (
                      <li key={o.id}>
                        {o.option_key}. {o.option_text} {o.is_correct && <span className="text-foreground">✓</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                    Ubah soal
                  </summary>
                  <QuestionFields assignmentId={id} question={q} options={opts} submitLabel="Simpan Soal" />
                </details>
                <details className="mt-2">
                  <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground">
                    Hapus soal
                  </summary>
                  <form action={deleteQuestion} className="mt-4 max-w-md space-y-3 border border-line p-5">
                    <input type="hidden" name="assignmentId" value={id} />
                    <input type="hidden" name="id" value={q.id} />
                    <p className="text-sm">
                      Menghapus soal ini juga menghapus jawaban siswa untuk soal tersebut. Salin teks soal untuk konfirmasi.
                    </p>
                    <TextInput name="confirm" placeholder="Salin teks soal di sini" required />
                    <Btn
                      type="submit"
                      className="border border-line-strong bg-transparent text-foreground hover:bg-foreground hover:text-background"
                    >
                      Hapus Soal
                    </Btn>
                  </form>
                </details>
              </div>
            );
          })}
          <details className="py-5">
            <summary className="cursor-pointer list-none font-serif text-lg">+ Tambah soal</summary>
            <QuestionFields assignmentId={id} question={null} options={[]} submitLabel="Tambah Soal" />
          </details>
        </div>
      </section>

      <section className="py-12">
        <SectionHeading index="04" title="Riwayat Perubahan" sub="Log" />
        {logs.length === 0 ? (
          <p className="border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted">
            Belum ada perubahan.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {logs.map((l) => {
              const actor = profiles.find((p) => p.id === l.changed_by);
              return (
                <div key={l.id} className="grid gap-2 py-4 text-sm sm:grid-cols-[180px_1fr]">
                  <p className="text-muted">{fmtDateTime(l.created_at)}</p>
                  <p>
                    <span className="font-medium">{l.action}</span> oleh {actor?.name ?? "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}