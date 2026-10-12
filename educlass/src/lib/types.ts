export type Role = "admin" | "student";

export type Profile = {
  id: string;
  name: string;
  nim: string | null;
  nip: string | null;
  email: string;
  role: Role;
  created_at: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type Material = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_by: string;
  created_at: string;
};

export type AssignmentStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "closed";

/** status: manual override (draft/paused) atau "" = dibawah kendali waktu */
export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  start_time: string;
  deadline: string;
  status: "draft" | "paused" | "";
  created_by: string;
  created_at: string;
  updated_at: string;
  requirement_path: string | null;
  requirement_name: string | null;
};

export type QuestionType = "multiple_choice" | "essay";
export type AnswerMethod = "text" | "pdf" | "text_and_pdf";

export type Question = {
  id: string;
  assignment_id: string;
  question_text: string;
  question_type: QuestionType;
  answer_method: AnswerMethod;
  score: number;
  order_number: number;
};

export type QuestionOption = {
  id: string;
  question_id: string;
  option_text: string;
  option_key: string;
  is_correct: boolean;
};

export type SubmissionStatus = "submitted" | "graded";

export type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  status: SubmissionStatus;
  total_score: number | null;
  feedback: string | null;
};

export type Answer = {
  id: string;
  submission_id: string;
  question_id: string;
  answer_text: string | null;
  file_path: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  score: number | null;
  feedback: string | null;
};

export type AssignmentLog = {
  id: string;
  assignment_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  created_at: string;
};

export type DB = {
  profiles: Profile[];
  courses: Course[];
  materials: Material[];
  assignments: Assignment[];
  questions: Question[];
  question_options: QuestionOption[];
  submissions: Submission[];
  answers: Answer[];
  logs: AssignmentLog[];
  passwords: Record<string, string>;
};