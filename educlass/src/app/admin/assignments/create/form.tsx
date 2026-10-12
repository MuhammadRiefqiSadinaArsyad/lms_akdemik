"use client";

import { useState } from "react";
import { Btn, Field, TextInput } from "@/components/ui";

type OptionDraft = { key: string; text: string; is_correct: boolean };
type QuestionDraft = {
  type: "multiple_choice" | "essay";
  question: string;
  score: number;
  answer_method: "text" | "pdf" | "text_and_pdf";
  options: OptionDraft[];
};

const letters = ["A", "B", "C", "D"];

export function AssignmentCreateForm({
  courses,
  action,
}: {
  courses: { id: string; code: string; name: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { type: "multiple_choice", question: "", score: 10, answer_method: "text", options: letters.map((l) => ({ key: l, text: "", is_correct: false })) },
  ]);

  function addQuestion() {
    setQuestions((q) => [
      ...q,
      { type: "multiple_choice", question: "", score: 10, answer_method: "text", options: letters.map((l) => ({ key: l, text: "", is_correct: false })) },
    ]);
  }

  function removeQuestion(i: number) {
    setQuestions((q) => q.filter((_, idx) => idx !== i));
  }

  function patch(i: number, p: Partial<QuestionDraft>) {
    setQuestions((q) => q.map((item, idx) => (idx === i ? { ...item, ...p } : item)));
  }

  function patchOption(qi: number, oi: number, p: Partial<OptionDraft>) {
    setQuestions((q) =>
      q.map((item, idx) =>
        idx === qi
          ? { ...item, options: item.options.map((o, j) => (j === oi ? { ...o, ...p } : o)) }
          : item,
      ),
    );
  }

  return (
    <form action={action} className="mt-12 max-w-3xl">
      <div className="space-y-6 border-b border-line pb-10">
        <Field label="Judul tugas" htmlFor="title">
          <TextInput id="title" name="title" placeholder="Contoh: Quiz 1 — HTML & CSS" required />
        </Field>
        <Field label="Mata kuliah" htmlFor="courseId">
          <select
            id="courseId"
            name="courseId"
            required
            className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deskripsi" htmlFor="description">
          <TextInput id="description" name="description" placeholder="Petunjuk/syarat pengerjaan…" />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Mulai" htmlFor="start">
            <input
              id="start"
              name="start"
              type="datetime-local"
              required
              className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
            />
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <input
              id="deadline"
              name="deadline"
              type="datetime-local"
              required
              className="w-full border-b border-line-strong bg-transparent py-3 text-sm focus:border-foreground focus:outline-none"
            />
          </Field>
        </div>
        <Field label="Lampiran soal (PDF, opsional)" htmlFor="requirement">
          <input
            id="requirement"
            name="requirement"
            type="file"
            accept="application/pdf"
            className="w-full text-sm file:mr-4 file:border file:border-line-strong file:px-4 file:py-2 file:text-sm"
          />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="status"
            value="draft"
            className="h-4 w-4 appearance-none border border-line-strong bg-panel checked:border-foreground checked:bg-foreground checked:after:content-['✓']"
          />
          Simpan sebagai draft (belum terlihat siswa)
        </label>
      </div>

      <section className="py-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Soal-soal</p>
        <div className="mt-8 space-y-12">
          {questions.map((q, qi) => (
            <div key={qi} className="border border-line p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-serif text-lg">Soal {String(qi + 1).padStart(2, "0")}</p>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-xs text-muted underline hover:text-foreground"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                <select
                  value={q.type}
                  onChange={(e) => patch(qi, { type: e.target.value as QuestionDraft["type"] })}
                  className="border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="essay">Essay</option>
                </select>
                <input
                  type="number"
                  value={q.score}
                  min={1}
                  onChange={(e) => patch(qi, { score: Number(e.target.value) })}
                  className="w-24 border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
                  aria-label="Skor"
                />
                <span className="self-end pb-2 text-xs text-muted">poin</span>
              </div>

              <textarea
                value={q.question}
                onChange={(e) => patch(qi, { question: e.target.value })}
                rows={3}
                placeholder="Teks pertanyaan…"
                required
                className="mt-4 w-full border border-line bg-panel p-4 text-sm focus:border-foreground focus:outline-none"
              />

              {q.type === "multiple_choice" ? (
                <div className="mt-4 space-y-2">
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => patchOption(qi, oi, { is_correct: !o.is_correct })}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong text-[10px] text-background"
                        aria-label={`Kunci jawaban ${letters[oi]}`}
                      >
                        {o.is_correct && <span className="block h-2.5 w-2.5 rounded-full bg-foreground" />}
                      </button>
                      <span className="w-4 text-xs text-muted">{letters[oi]}</span>
                      <input
                        value={o.text}
                        onChange={(e) => patchOption(qi, oi, { text: e.target.value })}
                        placeholder={`Pilihan ${letters[oi]}`}
                        className="flex-1 border-b border-line-strong bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted">
                    Klik lingkaran untuk menandai kunci jawaban.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {(["text", "pdf", "text_and_pdf"] as const).map((m) => (
                    <label key={m} className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name={`am-${qi}`}
                        checked={q.answer_method === m}
                        onChange={() => patch(qi, { answer_method: m })}
                        className="h-4 w-4 appearance-none rounded-full border border-line-strong checked:border-[5px] checked:border-foreground"
                      />
                      {m === "text" && "Jawaban teks"}
                      {m === "pdf" && "Upload PDF"}
                      {m === "text_and_pdf" && "Teks dan/atau PDF"}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="mt-8 border border-dashed border-line-strong px-5 py-3 text-sm transition-colors hover:border-foreground"
        >
          + Tambah Soal
        </button>
      </section>

      {/* serialisasi soal ke hidden input */}
      <input
        type="hidden"
        name="questions"
        value={JSON.stringify(
          questions.map((q) => ({
            type: q.type,
            question: q.question,
            score: q.score,
            answer_method: q.answer_method,
            options: q.type === "multiple_choice" ? q.options : undefined,
          })),
        )}
      />

      <div className="border-t border-line py-10">
        <Btn type="submit">Buat Tugas →</Btn>
      </div>
    </form>
  );
}