import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSubmission, getAssignment, getCourse, listQuestions, listQuestionOptions, listAnswers, listProfiles, gradeAnswers } from "@/lib/data";
import { Btn, SectionHeading, TextArea, TextInput } from "@/components/ui";
import { fmtDateTime, formatSize } from "@/lib/utils";

async function gradeSubmission(formData: FormData) {
  "use server";
  const user = await getSessionUser();
  if (!user) return;
  const submissionId = String(formData.get("submissionId") ?? "");
  const submission = await getSubmission(submissionId);
  if (!submission) return;

  const [answers, questions] = await Promise.all([
    listAnswers(submissionId),
    listQuestions(submission.assignment_id),
  ]);
  const options = await listQuestionOptions(questions.map((q) => q.id));

  const scores = [];
  for (const answer of answers) {
    const q = questions.find((qq) => qq.id === answer.question_id);
    if (!q) continue;

    let score: number;
    let feedback: string | null;
    if (q.question_type === "multiple_choice") {
      // penilaian otomatis: jawaban yang benar sesuai kunci
      const correct = options.find((o) => o.question_id === q.id && o.is_correct);
      const isCorrect = correct !== undefined && answer.answer_text === correct.option_key;
      score = isCorrect ? q.score : 0;
      feedback = isCorrect ? null : `Kunci: ${correct?.option_key ?? "—"}. ${correct?.option_text ?? ""}`;
    } else {
      const scoreVal = formData.get(`score-${answer.question_id}`);
      const feedbackVal = formData.get(`feedback-${answer.question_id}`);
      const parsed = Number(scoreVal);
      score =
        Number.isFinite(parsed) && scoreVal !== "" && scoreVal !== null
          ? Math.min(Math.max(parsed, 0), q.score)
          : q.score;
      feedback = typeof feedbackVal === "string" && feedbackVal.trim() ? feedbackVal.trim() : null;
    }
    scores.push({ question_id: q.id, score, feedback });
  }

  const submissionFeedback = String(formData.get("submissionFeedback") ?? "").trim() || null;
  await gradeAnswers({ submission_id: submissionId, scores, feedback: submissionFeedback });

  redirect(`/admin/assignments/${submission.assignment_id}/submissions`);
}

export default async function AdminGradeSubmission({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const [allProfiles, assignment] = await Promise.all([
    listProfiles(),
    getAssignment(submission.assignment_id),
  ]);
  if (!assignment) notFound();
  const student = allProfiles.find((p) => p.id === submission.student_id);
  const course = await getCourse(assignment.course_id);
  const questions = (await listQuestions(assignment.id)).sort((a, b) => a.order_number - b.order_number);
  const answers = (await listAnswers(submission.id)).sort((a, b) => {
    const qa = questions.findIndex((q) => q.id === a.question_id);
    const qb = questions.findIndex((q) => q.id === b.question_id);
    return qa - qb;
  });
  const options = await listQuestionOptions(questions.map((q) => q.id));

  return (
    <div className="fade-up">
      <header className="border-b border-line pb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {course?.code} — {assignment.title}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">
          Penilaian.
        </h1>
        <p className="mt-2 text-sm text-muted">
          NIM {student?.nim} · Dikumpulkan {fmtDateTime(submission.submitted_at)}
        </p>
        <div className="mt-6 flex items-center gap-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Status</p>
          <p className="text-sm font-medium">
            {submission.total_score !== null ? `Dinilai · ${submission.total_score}` : "Belum dinilai"}
          </p>
        </div>
      </header>

      <form action={gradeSubmission} className="mt-12">
        <input type="hidden" name="submissionId" value={submission.id} />

        <div className="space-y-14">
          {questions.map((q, qi) => {
            const answer = answers.find((a) => a.question_id === q.id);
            const correct = options.find((o) => o.question_id === q.id && o.is_correct);
            const isPG = q.question_type === "multiple_choice";
            const score = answer?.score ?? null;
            return (
              <fieldset key={q.id}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Soal {String(qi + 1).padStart(2, "0")} · {q.score} poin ·{" "}
                  {isPG ? "Pilihan Ganda" : "Essay"}
                </p>
                <p className="mt-3 whitespace-pre-line font-serif text-2xl leading-snug">
                  {q.question_text}
                </p>

                {/* Jawaban siswa */}
                <div className="mt-6 border-l-2 border-line-strong pl-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Jawaban siswa</p>
                  {isPG ? (
                    <p className="mt-2 text-sm">
                      {(() => {
                        const chosen = options.find(
                          (o) => o.question_id === q.id && o.option_key === answer?.answer_text,
                        );
                        return chosen
                          ? `${chosen.option_key}. ${chosen.option_text}`
                          : "— tidak dijawab";
                      })()}
                    </p>
                  ) : answer?.answer_text ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                      {answer.answer_text}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">— tidak ada jawaban teks</p>
                  )}

                  {answer?.file_path && (
                    <p className="mt-3 text-sm">
                      <a
                        href={`/api/files?path=${encodeURIComponent(answer.file_path)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="u-link font-medium"
                      >
                        Buka PDF {answer.file_name ? `(${answer.file_name})` : ""}
                      </a>
                      {answer.file_size != null && (
                        <span className="ml-2 text-xs text-muted">{formatSize(answer.file_size)}</span>
                      )}
                    </p>
                  )}

                  {/* Kunci untuk PG */}
                  {isPG && correct && (
                    <p className="mt-2 text-sm text-muted">
                      Kunci: {correct.option_key}. {correct.option_text}
                    </p>
                  )}
                  {isPG && (
                    <p className="mt-1 text-sm">
                      {score === q.score && (
                        <span className="font-medium text-foreground">Benar · {score} poin</span>
                      )}
                      {score === 0 && <span className="text-muted">Salah · 0 poin</span>}
                    </p>
                  )}
                </div>

                {/* Input nilai untuk essay */}
                {!isPG && (
                  <div className="mt-6 grid gap-6 sm:grid-cols-[120px_1fr]">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor={`score-${q.id}`}>
                        Nilai
                      </label>
                      <input
                        id={`score-${q.id}`}
                        name={`score-${q.id}`}
                        type="number"
                        min={0}
                        max={q.score}
                        defaultValue={score ?? ""}
                        placeholder={`0–${q.score}`}
                        className="mt-2 w-full border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor={`feedback-${q.id}`}>
                        Feedback (opsional)
                      </label>
                      <TextArea
                        id={`feedback-${q.id}`}
                        name={`feedback-${q.id}`}
                        rows={2}
                        defaultValue={answer?.feedback ?? ""}
                        placeholder="Catatan untuk mahasiswa…"
                        className="mt-2 bg-panel p-3"
                      />
                    </div>
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Feedback keseluruhan</p>
              <TextArea
                name="submissionFeedback"
                rows={3}
                defaultValue={submission.feedback ?? ""}
                placeholder="Catatan umum untuk jawaban ini…"
                className="mt-3 bg-panel p-4"
              />
            </div>
            <Btn type="submit">Simpan Nilai →</Btn>
          </div>
        </div>
      </form>
    </div>
  );
}