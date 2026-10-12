-- EduClass — Supabase schema (jalankan di SQL Editor)
-- ponytail: idempotent; ulang aman

-- 1) profiles: mirror auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  nim text unique,
  nip text,
  email text not null,
  role text not null check (role in ('admin','student')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2) courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  description text default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.courses enable row level security;

-- 3) materials
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text default '',
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size int not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.materials enable row level security;

-- 4) assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text default '',
  start_time timestamptz not null,
  deadline timestamptz not null,
  status text not null default '' check (status in ('','draft','paused')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  requirement_path text,
  requirement_name text
);
-- proyek yang sudah jalan: tambah kolom lampiran soal
alter table public.assignments add column if not exists requirement_path text;
alter table public.assignments add column if not exists requirement_name text;
alter table public.assignments enable row level security;

-- 5) questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice','essay')),
  answer_method text not null check (answer_method in ('text','pdf','text_and_pdf')),
  score int not null,
  order_number int not null,
  created_at timestamptz default now()
);
alter table public.questions enable row level security;

-- 6) question_options
create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  option_key text not null,
  is_correct boolean not null default false
);
alter table public.question_options enable row level security;

-- 7) submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz default now(),
  status text not null check (status in ('submitted','graded')),
  total_score int,
  feedback text,
  unique (assignment_id, student_id)
);
alter table public.submissions enable row level security;

-- 8) answers
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_text text,
  file_path text,
  file_name text,
  file_type text,
  file_size int,
  score int,
  feedback text,
  unique (submission_id, question_id)
);
alter table public.answers enable row level security;

-- 9) assignment_logs
create table if not exists public.assignment_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  action text not null,
  old_value text,
  new_value text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.assignment_logs enable row level security;

-- RLS: buka baca untuk authed; tulis dibatasi via service_role di server
-- Siswa: hanya submission milik sendiri
drop policy if exists "profiles self or admin" on public.profiles;
create policy "profiles self or admin" on public.profiles for select using (auth.role() = 'authenticated');

drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses for select using (auth.role() = 'authenticated');
drop policy if exists "materials read" on public.materials;
create policy "materials read" on public.materials for select using (auth.role() = 'authenticated');
drop policy if exists "assignments read" on public.assignments;
create policy "assignments read" on public.assignments for select using (auth.role() = 'authenticated');
drop policy if exists "questions read" on public.questions;
create policy "questions read" on public.questions for select using (auth.role() = 'authenticated');
drop policy if exists "options read" on public.question_options;
create policy "options read" on public.question_options for select using (auth.role() = 'authenticated');
drop policy if exists "submissions own or admin" on public.submissions;
create policy "submissions own or admin" on public.submissions for select using (auth.uid() = student_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "answers own or admin" on public.answers;
create policy "answers own or admin" on public.answers for select using (
  exists (select 1 from public.submissions s where s.id = submission_id and (s.student_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')))
);

-- Storage buckets (buat manual atau via SQL jika storage schema ada)
insert into storage.buckets (id, name, public) values
  ('learning-materials','learning-materials', false),
  ('student-submissions','student-submissions', false)
on conflict do nothing;
