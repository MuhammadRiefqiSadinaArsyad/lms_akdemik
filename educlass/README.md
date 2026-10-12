# EduClass

Platform perkuliahan: materi, tugas/quiz, pengumpulan jawaban (teks + PDF), dan penilaian.
Next.js 16 (App Router, React Server Actions, Tailwind v4) + Supabase (Postgres, Auth, Storage).

## Menjalankan

Butuh Node 20+ dan sebuah proyek Supabase.

```bash
npm install

# 1. skema + bucket + RLS
#    paste seluruh isi supabase.sql ke Supabase → SQL Editor → Run
# 2. kredensial
cp .env.example .env.local   # isi dari Supabase → Project Settings → API

# 3. data contoh (opsional)
npm run seed

npm run dev
```

Tanpa `.env.local`, app jalan di mode mock in-memory (`src/lib/db.ts`) — berguna untuk
demo UI tanpa database.

### Akun contoh (setelah `npm run seed`)

| Peran  | Email                | Password   |
| ------ | -------------------- | ---------- |
| Dosen  | budi@educlass.id     | `budi123`  |
| Siswa  | ahmad@educlass.id    | `ahmad123` |
| Siswa  | rina@educlass.id     | `rina123`  |
| Siswa  | citra@educlass.id    | `citra123` |

Siswa juga bisa masuk memakai NIM (`2301005`, `2301006`, `2301007`) sebagai kolom email.

## Catatan arsitektur

- Semua tulis lewat **server action** memakai `SUPABASE_SERVICE_ROLE_KEY`; RLS
  di-set **read-only** (`src/lib/data.ts`). Jangan pernah memakai service role key
  di kode yang jalan di browser.
- Sesi login disimpan sebagai cookie `ec_session` berisi id profil (`src/lib/auth.ts`),
  bukan token Supabase.
- File disimpan di bucket privat `learning-materials` dan `student-submissions`,
 _MAX 10 MB, PDF saja_ — divalidasi `checkUpload()` sebelum diunggah.

## Prasyarat opsional

- **Lupa/reset password** butuh SMTP di Supabase → Authentication → SMTP, dan
  `/reset-password` terdaftar di *Redirect URLs*.
- **Login Google** butuh OAuth Client ID/Secret di Supabase → Authentication →
  Providers → Google, dan `/login` terdaftar di *Redirect URLs*.