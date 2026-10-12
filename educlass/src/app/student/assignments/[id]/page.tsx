import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAssignment, getCourse, listQuestions, listQuestionOptions, listSubmissions, listAnswers, saveAnswers } from "@/lib/data";
import { putFile, checkUpload } from "@/lib/storage";
import { Btn, SectionHeading, TextArea } from "@/components/ui";
import { fmtDateTime, fmtTime } from "@/lib/utils";
import type { Answer } from "@/lib/types";

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const [course, questions, allSubmissions] = await Promise.all([
    getCourse(assignment.course_id),
    listQuestions(assignment.id),
    listSubmissions(assignment.id),
  ]);
  const options = await listQuestionOptions(questions.map((q) => q.id));

  const submission = allSubmissions.find((s) => s.student_id === user.id);
  const answers = submission ? await listAnswers(submission.id) : [];

  const now = Date.now();
  const start = new Date(assignment.start_time).getTime();
  const deadline = new Date(assignment.deadline).getTime();
  const beforeStart = now < start;
  const paused = assignment.status === "paused";
  const afterDeadline = now > deadline;
  const locked = assignment.status === "draft" || paused || beforeStart || afterDeadline;
  // jawaban boleh diperbaiki selama tugas belum ditutup dan belum dinilai
  const editable = !locked && submission?.status !== "graded";

  return (
    <div className="fade-up">
      {/* header dengan status + countdown */}
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{course?.code} — Tugas</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">{assignment.title}.</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{assignment.description}</p>
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
        {!locked && !submission && (
          <p className="mt-6 inline-block border border-foreground px-3 py-1 text-xs uppercase tracking-[0.18em]">
            Aktif · {new Date(assignment.deadline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {submission && (
          <p className="mt-6 text-sm text-muted">
            Status: <span className="font-medium text-foreground">Sudah Dikumpulkan</span> ·{" "}
            {fmtTime(submission.submitted_at)}
            {submission.total_score !== null && (
              <> · Nilai: <span className="font-medium text-foreground">{submission.total_score}</span></>
            )}
          </p>
        )}
      </header>

      {/* area mengerjakan */}
      {submission && !editable ? (
        <section className="py-14">
          <SectionHeading index="✓" title="Jawaban kamu telah terkirim" sub="Submission diterima" />
          <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
            <div className="space-y-10">
              {questions.map((q, qi) => {
                const ans = answers.find((a) => a.question_id === q.id);
                const opts = options.filter((o) => o.question_id === q.id);
                return (
                  <div key={q.id}>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                      Soal {String(qi + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 whitespace-pre-line font-serif text-xl leading-snug">
                      {q.question_text}
                    </p>
                    {ans?.answer_text && (
                      <p className="mt-4 whitespace-pre-line border-l-2 border-line-strong pl-4 text-sm leading-relaxed">
                        {ans.answer_text}
                      </p>
                    )}
                    {ans?.file_path && (
                      <a
                        href={`/api/files?path=${encodeURIComponent(ans.file_path)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="u-link mt-4 inline-block text-sm font-medium"
                      >
                        {ans.file_name || "Buka PDF"} (PDF)
                      </a>
                    )}
                    {!ans && <p className="mt-4 text-sm text-muted">— tidak dijawab</p>}
                  </div>
                );
              })}
            </div>
            <aside className="border-l border-line pl-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Pengumpul</p>
              <p className="mt-2 font-serif text-xl">{user.name}</p>
              <p className="text-sm text-muted">NIM {user.nim}</p>
              <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">Waktu kirim</p>
              <p className="mt-2 text-sm">{fmtTime(submission.submitted_at)}</p>
              {submission.feedback && (
                <>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">Feedback Dosen</p>
                  <p className="mt-2 text-sm leading-relaxed">{submission.feedback}</p>
                </>
              )}
            </aside>
          </div>
        </section>
      ) : locked ? (
        <section className="py-14">
          <div className="border border-dashed border-line-strong px-8 py-16 text-center">
            <p className="font-serif text-2xl">
              {assignment.status === "draft"
                ? "Tugas ini belum dipublikasikan."
                : paused
                  ? "Tugas sedang ditunda oleh dosen."
                  : beforeStart
                    ? `Belum dimulai. Mulai ${fmtDateTime(assignment.start_time)}.`
                    : "Pengumpulan sudah ditutup."}
            </p>
            {afterDeadline && (
              <p className="mt-2 text-sm text-muted">
                Deadline telah lewat pada {fmtDateTime(assignment.deadline)}.
              </p>
            )}
            {paused && (
              <p className="mt-2 text-sm text-muted">
                Pengumpulan dibuka kembali oleh dosen.
              </p>
            )}
          </div>
        </section>
      ) : (
        <AssignmentForm
          assignmentId={assignment.id}
          userName={user.name}
          nim={user.nim ?? ""}
          initial={answers}
          isEdit={Boolean(submission)}
        />
      )}
    </div>
  );
}


async function AssignmentForm({
  assignmentId,
  userName,
  nim,
  initial,
  isEdit,
}: {
  assignmentId: string;
  userName: string;
  nim: string;
  initial: Answer[];
  isEdit: boolean;
}) {
  const questions = await listQuestions(assignmentId);
  const options = await listQuestionOptions(questions.map((q) => q.id));
  const prev = new Map(initial.map((a) => [a.question_id, a]));

  return (
    <form action={submitAnswer} className="pt-14">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div className="space-y-14">
        {questions.map((q, qi) => {
          const opts = options.filter((o) => o.question_id === q.id);
          const saved = prev.get(q.id);
          return (
            <fieldset key={q.id}>
              <legend className="sr-only">Soal {qi + 1}</legend>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Soal {String(qi + 1).padStart(2, "0")} · {q.score} poin
              </p>
              <p className="mt-3 whitespace-pre-line font-serif text-2xl leading-snug">
                {q.question_text}
              </p>

              {q.question_type === "multiple_choice" && (
                <div className="mt-8 space-y-2">
                  {opts.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-center gap-4 border border-line px-5 py-4 transition-colors hover:border-foreground has-[:checked]:border-foreground"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={o.option_key}
                        defaultChecked={saved?.answer_text === o.option_key}
                        required
                        className="h-4 w-4 appearance-none rounded-full border border-line-strong checked:border-[6px] checked:border-foreground"
                      />
                      <span className="text-sm">{o.option_text}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "essay" && (q.answer_method === "text" || q.answer_method === "text_and_pdf") && (
                <TextArea
                  name={`q-${q.id}`}
                  rows={5}
                  defaultValue={saved?.answer_text ?? ""}
                  placeholder="Tulis jawabanmu di sini…"
                  className="mt-6 bg-panel p-4"
                />
              )}

              {q.question_type === "essay" && (q.answer_method === "pdf" || q.answer_method === "text_and_pdf") && (
                <div className="mt-6">
                  <label className="mt-6 inline-block cursor-pointer border border-line-strong px-5 py-3 text-sm font-medium transition-colors hover:border-foreground">
                    <span>{saved?.file_path ? "Ganti PDF jawaban" : "Upload PDF — jawaban kamu"}</span>
                    <input
                      type="file"
                      name={`file-${q.id}`}
                      accept="application/pdf"
                      className="sr-only"
                      required={q.answer_method === "pdf" && !saved?.file_path}
                    />
                  </label>
                  <p className="mt-3 text-xs text-muted">
                    {q.answer_method === "pdf"
                      ? "Kerjakan di buku tulis, lalu scan/foto dan kumpulkan dalam bentuk PDF (maks. 10 MB)."
                      : "Opsional: lampirkan PDF pendukung (maks. 10 MB)."}
                  </p>
                  <p className="mt-1 text-xs text-muted" id={`file-${q.id}-name`}>
                    {saved?.file_path ? `✓ ${saved.file_name ?? "PDF tersimpan"}` : ""}
                  </p>
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `
                        Array.from(document.querySelectorAll('input[name="file-${q.id}"]')).forEach((el) => {
                          el.addEventListener('change', () => {
                            const n = document.getElementById('file-${q.id}-name');
                            if (n && el.files && el.files[0]) n.textContent = '✓ ' + el.files[0].name;
                          });
                        });
                      `,
                    }}
                  />
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {/* ringkasan pengumpul + submit */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {isEdit ? "Perbaiki jawaban?" : "Ready to submit?"}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted">
              {isEdit
                ? "Kirim ulang akan menggantikan jawaban sebelumnya. PDF yang sudah terlampir tetap dipakai bila tidak ada file baru."
                : "Pastikan seluruh jawaban sudah benar sebelum mengirim."}
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">
              Akan dikirim sebagai
            </p>
            <p className="mt-2 font-serif text-xl">
              {userName} <span className="text-sm text-muted">· NIM {nim}</span>
            </p>
          </div>
          <Btn type="submit" className="min-w-52">{isEdit ? "Kirim Ulang Jawaban →" : "Submit Answer →"}</Btn>
        </div>
      </div>
    </form>
  );
}

async function submitAnswer(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  if (user.role !== "student") return;

  const assignmentId = String(formData.get("assignmentId") ?? "");
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return;
  if (assignment.status === "draft" || assignment.status === "paused") return;
  const now = Date.now();
  if (now < new Date(assignment.start_time).getTime()) return;
  if (now > new Date(assignment.deadline).getTime()) return;

  const existing = (await listSubmissions(assignmentId)).find((s) => s.student_id === user.id);
  if (existing?.status === "graded") return;
  const keptAnswers = existing ? await listAnswers(existing.id) : [];
  const kept = new Map(keptAnswers.map((a) => [a.question_id, a]));
  const questions = await listQuestions(assignmentId);


  const answers = [];
  for (const q of questions) {
    const textVal = formData.get(`q-${q.id}`);
    const text = typeof textVal === "string" && textVal.trim() ? textVal.trim() : null;

    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;
    if (q.answer_method !== "text") {
      const f = formData.get(`file-${q.id}`);
      if (f instanceof File && f.size > 0) {
        if (checkUpload(f)) return;
        filePath = `submissions/${user.id}/${assignmentId}/answ-${q.id}.pdf`;
        await putFile(filePath, Buffer.from(await f.arrayBuffer()), f.name, f.type);
        fileName = f.name;
        fileType = f.type;
        fileSize = f.size;
      } else {
        const previous = kept.get(q.id);
        filePath = previous?.file_path ?? null;
        fileName = previous?.file_name ?? null;
        fileType = previous?.file_type ?? null;
        fileSize = previous?.file_size ?? null;
      }
    }
    answers.push({
      question_id: q.id,
      answer_text: text,
      file_path: filePath,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      score: null,
      feedback: null,
    });
  }

  await saveAnswers({ assignment_id: assignmentId, student_id: user.id, answers });
  redirect(`/student/assignments/${assignmentId}`);
}