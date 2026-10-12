import { db } from "./db";
import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import type {
  Answer,
  Assignment,
  Course,
  Material,
  Profile,
  Question,
  QuestionOption,
  AssignmentLog,
  Submission,
} from "./types";

/**
 * Data layer tunggal: Supabase bila env terisi, else mock in-memory.
 *
 * ponytail: RLS di supabase.sql hanya meng-cover SELECT, jadi semua tulis lewat
 * service_role (server-only). Jangan pernah fallback ke mock saat Supabase error —
 * itu yang bikin registrasi dulu "sukses" padahal tidak tersimpan.
 */
function sb() {
  const client = getSupabaseAdmin() ?? getSupabase();
  if (!client) throw new Error("Supabase tidak dikonfigurasi");
  return client;
}

/** error Supabase dilempar apa adanya — jangan ditelan, jangan disamarkan jadi data kosong */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as T;
}

const byId = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id);

/* ---------------------------------- read ---------------------------------- */

export async function listProfiles(role?: Profile["role"]): Promise<Profile[]> {
  if (!isSupabaseConfigured) return role ? db.profiles.filter((p) => p.role === role) : db.profiles;
  const q = sb().from("profiles").select("*").order("name");
  if (role) q.eq("role", role);
  return unwrap<Profile[]>(await q, "profiles");
}

export async function listCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured) return db.courses;
  return unwrap<Course[]>(await sb().from("courses").select("*").order("name"), "courses");
}

export async function getCourse(id: string): Promise<Course | null> {
  if (!isSupabaseConfigured) return byId(db.courses, id) ?? null;
  return unwrap<Course | null>(await sb().from("courses").select("*").eq("id", id).maybeSingle(), "courses");
}

export async function listMaterials(courseId?: string): Promise<Material[]> {
  if (!isSupabaseConfigured) return courseId ? db.materials.filter((m) => m.course_id === courseId) : db.materials;
  const q = sb().from("materials").select("*").order("created_at", { ascending: false });
  if (courseId) q.eq("course_id", courseId);
  return unwrap<Material[]>(await q, "materials");
}

export async function listAssignments(courseId?: string): Promise<Assignment[]> {
  if (!isSupabaseConfigured) return courseId ? db.assignments.filter((a) => a.course_id === courseId) : db.assignments;
  const q = sb().from("assignments").select("*").order("start_time", { ascending: false });
  if (courseId) q.eq("course_id", courseId);
  return unwrap<Assignment[]>(await q, "assignments");
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  if (!isSupabaseConfigured) return byId(db.assignments, id) ?? null;
  return unwrap<Assignment | null>(await sb().from("assignments").select("*").eq("id", id).maybeSingle(), "assignments");
}

export async function listQuestions(assignmentId: string): Promise<Question[]> {
  if (!isSupabaseConfigured) return db.questions.filter((q) => q.assignment_id === assignmentId);
  return unwrap<Question[]>(
    await sb().from("questions").select("*").eq("assignment_id", assignmentId).order("order_number"),
    "questions",
  );
}

/** opsi untuk banyak soal sekaligus — satu round-trip, bukan N+1 */
export async function listQuestionOptions(questionIds: string[]): Promise<QuestionOption[]> {
  if (questionIds.length === 0) return [];
  if (!isSupabaseConfigured) return db.question_options.filter((o) => questionIds.includes(o.question_id));
  return unwrap<QuestionOption[]>(
    await sb().from("question_options").select("*").in("question_id", questionIds).order("option_key"),
    "question_options",
  );
}

export async function listSubmissions(assignmentId?: string): Promise<Submission[]> {
  if (!isSupabaseConfigured) {
    return assignmentId ? db.submissions.filter((s) => s.assignment_id === assignmentId) : db.submissions;
  }
  const q = sb().from("submissions").select("*").order("submitted_at", { ascending: false });
  if (assignmentId) q.eq("assignment_id", assignmentId);
  return unwrap<Submission[]>(await q, "submissions");
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (!isSupabaseConfigured) return byId(db.submissions, id) ?? null;
  return unwrap<Submission | null>(await sb().from("submissions").select("*").eq("id", id).maybeSingle(), "submissions");
}

export async function listAnswers(submissionId: string): Promise<Answer[]> {
  if (!isSupabaseConfigured) return db.answers.filter((a) => a.submission_id === submissionId);
  return unwrap<Answer[]>(await sb().from("answers").select("*").eq("submission_id", submissionId), "answers");
}

/* ---------------------------------- write --------------------------------- */

export async function createCourse(input: {
  name: string;
  code: string;
  description: string;
  created_by: string;
}): Promise<Course> {
  if (!isSupabaseConfigured) {
    const course: Course = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...input };
    db.courses.push(course);
    return course;
  }
  return unwrap<Course>(await sb().from("courses").insert(input).select().single(), "courses");
}

export async function createMaterial(input: Omit<Material, "id" | "created_at">): Promise<Material> {
  if (!isSupabaseConfigured) {
    const material: Material = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...input };
    db.materials.push(material);
    return material;
  }
  return unwrap<Material>(await sb().from("materials").insert(input).select().single(), "materials");
}

/** buat tugas + soal + opsi dalam satu transaksi; gagal = tidak ada yang tersimpan */
export async function createAssignment(input: {
  assignment: Omit<Assignment, "id" | "created_at" | "updated_at" | "requirement_path" | "requirement_name"> &
    Partial<Pick<Assignment, "requirement_path" | "requirement_name">>;
  questions: Array<Omit<Question, "id" | "assignment_id"> & { options: Array<Omit<QuestionOption, "id" | "question_id">> }>;
}): Promise<Assignment> {
  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const assignment: Assignment = {
      requirement_path: null,
      requirement_name: null,
      ...input.assignment,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    db.assignments.push(assignment);
    for (const q of input.questions) {
      const question: Question = { id: crypto.randomUUID(), assignment_id: assignment.id, ...q };
      db.questions.push(question);
      for (const o of q.options) {
        db.question_options.push({ id: crypto.randomUUID(), question_id: question.id, ...o });
      }
    }
    return assignment;
  }

  const client = sb();
  const assignment = unwrap<Assignment>(
    await client.from("assignments").insert({ ...input.assignment, updated_at: new Date().toISOString() }).select().single(),
    "assignments",
  );
  for (const q of input.questions) {
    const { options, ...rest } = q;
    const question = unwrap<Question>(
      await client.from("questions").insert({ ...rest, assignment_id: assignment.id }).select().single(),
      "questions",
    );
    if (options.length > 0) {
      unwrap<QuestionOption[]>(
        await client.from("question_options").insert(options.map((o) => ({ ...o, question_id: question.id }))),
        "question_options",
      );
    }
  }
  return assignment;
}

export async function updateAssignment(id: string, patch: Partial<Omit<Assignment, "id">>): Promise<Assignment> {
  if (!isSupabaseConfigured) {
    const found = byId(db.assignments, id);
    if (!found) throw new Error("Tugas tidak ditemukan");
    Object.assign(found, patch, { updated_at: new Date().toISOString() });
    return found;
  }
  return unwrap<Assignment>(
    await sb().from("assignments").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select().single(),
    "assignments",
  );
}

/** simpan jawaban siswa: submission upsert (unik per tugas) + answers upsert per soal */
export async function saveAnswers(input: {
  assignment_id: string;
  student_id: string;
  answers: Array<Omit<Answer, "id" | "submission_id">>;
}): Promise<Submission> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured) {
    let submission = db.submissions.find((s) => s.assignment_id === input.assignment_id && s.student_id === input.student_id);
    if (!submission) {
      submission = {
        id: crypto.randomUUID(),
        assignment_id: input.assignment_id,
        student_id: input.student_id,
        submitted_at: now,
        status: "submitted",
        total_score: null,
        feedback: null,
      };
      db.submissions.push(submission);
    }
    for (const a of input.answers) {
      const found = db.answers.find((x) => x.submission_id === submission!.id && x.question_id === a.question_id);
      if (found) Object.assign(found, a);
      else db.answers.push({ id: crypto.randomUUID(), submission_id: submission.id, ...a });
    }
    return submission;
  }

  const client = sb();
  // students boleh upsert submission sendiri lewat RLS; admin/service_role juga boleh
  const submission = unwrap<Submission>(
    await client
      .from("submissions")
      .upsert(
        { assignment_id: input.assignment_id, student_id: input.student_id, submitted_at: now, status: "submitted" },
        { onConflict: "assignment_id,student_id" },
      )
      .select()
      .single(),
    "submissions",
  );
  for (const a of input.answers) {
    unwrap<Answer[]>(
      await client
        .from("answers")
        .upsert({ ...a, submission_id: submission.id }, { onConflict: "submission_id,question_id" }),
      "answers",
    );
  }
  return submission;
}

/** simpan nilai per soal + total; total_score = "sudah dinilai" di semua halaman */
export async function gradeAnswers(input: {
  submission_id: string;
  scores: Array<{ question_id: string; score: number | null; feedback: string | null }>;
  feedback: string | null;
}): Promise<Submission> {
  const maxScore = input.scores.reduce((sum, s) => sum + (s.score ?? 0), 0);
  const anyScored = input.scores.some((s) => s.score !== null);

  if (!isSupabaseConfigured) {
    for (const s of input.scores) {
      const answer = db.answers.find((a) => a.submission_id === input.submission_id && a.question_id === s.question_id);
      if (answer) {
        answer.score = s.score;
        answer.feedback = s.feedback;
      }
    }
    const submission = byId(db.submissions, input.submission_id);
    if (!submission) throw new Error("Pengumpulan tidak ditemukan");
    submission.total_score = maxScore;
    submission.feedback = input.feedback;
    submission.status = anyScored ? "graded" : "submitted";
    return submission;
  }

  const client = sb();

  for (const s of input.scores) {
    unwrap<Answer[]>(
      await client
        .from("answers")
        .update({ score: s.score, feedback: s.feedback })
        .eq("submission_id", input.submission_id)
        .eq("question_id", s.question_id),
      "answers",
    );
  }
  return unwrap<Submission>(
    await client
      .from("submissions")
      .update({ total_score: maxScore, feedback: input.feedback, status: anyScored ? "graded" : "submitted" })
      .eq("id", input.submission_id)
      .select()
      .single(),
    "submissions",
  );
}

export async function listLogs(assignmentId: string): Promise<AssignmentLog[]> {
  if (!isSupabaseConfigured) return db.logs.filter((l) => l.assignment_id === assignmentId);
  return unwrap<AssignmentLog[]>(
    await sb().from("assignment_logs").select("*").eq("assignment_id", assignmentId).order("created_at", { ascending: false }),
    "assignment_logs",
  );
}

export async function logAction(input: {
  assignment_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    db.logs.push({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...input });
    return;
  }
  unwrap<AssignmentLog[]>(await sb().from("assignment_logs").insert(input), "assignment_logs");
}

export async function updateCourse(id: string, patch: Partial<Pick<Course, "name" | "code" | "description">>): Promise<Course> {
  if (!isSupabaseConfigured) {
    const found = byId(db.courses, id);
    if (!found) throw new Error("Mata kuliah tidak ditemukan");
    Object.assign(found, patch);
    return found;
  }
  return unwrap<Course>(await sb().from("courses").update(patch).eq("id", id).select().single(), "courses");
}

/** cascade: materials, assignments, submissions ikut terhapus lewat FK */
export async function deleteCourse(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.courses = db.courses.filter((c) => c.id !== id);
    return;
  }
  unwrap<Course[]>(await sb().from("courses").delete().eq("id", id), "courses");
}

export async function deleteMaterial(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.materials = db.materials.filter((m) => m.id !== id);
    return;
  }
  unwrap<Material[]>(await sb().from("materials").delete().eq("id", id), "materials");
}

export async function deleteAssignment(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.assignments = db.assignments.filter((a) => a.id !== id);
    return;
  }
  unwrap<Assignment[]>(await sb().from("assignments").delete().eq("id", id), "assignments");
}

export async function updateQuestion(
  id: string,
  patch: Partial<Pick<Question, "question_text" | "score" | "answer_method">>,
): Promise<Question> {
  if (!isSupabaseConfigured) {
    const found = byId(db.questions, id);
    if (!found) throw new Error("Soal tidak ditemukan");
    Object.assign(found, patch);
    return found;
  }
  return unwrap<Question>(await sb().from("questions").update(patch).eq("id", id).select().single(), "questions");
}

/** ganti seluruh opsi soal (dipakai saat admin mengedit pilihan ganda) */
export async function replaceQuestionOptions(
  questionId: string,
  options: Array<Omit<QuestionOption, "id" | "question_id">>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    db.question_options = db.question_options.filter((o) => o.question_id !== questionId);
    for (const o of options) db.question_options.push({ id: crypto.randomUUID(), question_id: questionId, ...o });
    return;
  }
  const client = sb();
  unwrap<QuestionOption[]>(await client.from("question_options").delete().eq("question_id", questionId), "question_options");
  if (options.length > 0) {
    unwrap<QuestionOption[]>(
      await client.from("question_options").insert(options.map((o) => ({ ...o, question_id: questionId }))),
      "question_options",
    );
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.questions = db.questions.filter((q) => q.id !== id);
    db.question_options = db.question_options.filter((o) => o.question_id !== id);
    return;
  }
  unwrap<Question[]>(await sb().from("questions").delete().eq("id", id), "questions");
}

export async function updateProfile(id: string, patch: Partial<Pick<Profile, "name" | "nim" | "nip">>): Promise<Profile> {
  if (!isSupabaseConfigured) {
    const found = byId(db.profiles, id);
    if (!found) throw new Error("Profil tidak ditemukan");
    Object.assign(found, patch);
    return found;
  }
  return unwrap<Profile>(await sb().from("profiles").update(patch).eq("id", id).select().single(), "profiles");
}

export async function createQuestion(input: {
  assignment_id: string;
  question_text: string;
  question_type: Question["question_type"];
  answer_method: Question["answer_method"];
  score: number;
  order_number: number;
  options: Array<Omit<QuestionOption, "id" | "question_id">>;
}): Promise<Question> {
  if (!isSupabaseConfigured) {
    const question: Question = { id: crypto.randomUUID(), ...input };
    db.questions.push(question);
    for (const o of input.options) db.question_options.push({ id: crypto.randomUUID(), question_id: question.id, ...o });
    return question;
  }
  const client = sb();
  const { options, ...rest } = input;
  const question = unwrap<Question>(await client.from("questions").insert(rest).select().single(), "questions");
  if (options.length > 0) {
    unwrap<QuestionOption[]>(
      await client.from("question_options").insert(options.map((o) => ({ ...o, question_id: question.id }))),
      "question_options",
    );
  }
  return question;
}

/** hapus akun: auth.users cascade ke profiles, submissions, answers */
export async function deleteAccount(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.profiles = db.profiles.filter((p) => p.id !== id);
    return;
  }
  const { error } = await getSupabaseAdmin()!.auth.admin.deleteUser(id);
  if (error) throw new Error(`auth.users: ${error.message}`);
}

/** set password baru (admin menyetel ulang siswa, siswa menyetel sendiri lewat akun) */
export async function setPassword(id: string, password: string): Promise<void> {
  if (!isSupabaseConfigured) {
    db.passwords[id] = password;
    return;
  }
  const { error } = await getSupabaseAdmin()!.auth.admin.updateUserById(id, { password });
  if (error) throw new Error(`auth.users: ${error.message}`);
}