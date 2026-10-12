
# PERANCANGAN APLIKASI PEMBELAJARAN PERKULIAHAN

## 1. Informasi Proyek

**Nama sementara:** EduQuiz / ClassLearn
**Jenis aplikasi:** Web Application
**Framework:** Next.js
**Bahasa:** TypeScript
**Database:** Supabase PostgreSQL
**File Storage:** Supabase Storage
**Styling:** Tailwind CSS
**ORM:** Prisma (opsional)
**Authentication:** Supabase Auth
**Deployment:** Vercel

---

# 2. Deskripsi Aplikasi

Aplikasi ini merupakan platform pembelajaran perkuliahan berbasis web yang digunakan oleh **dosen/admin** dan **siswa/mahasiswa**.

Dosen dapat mengunggah materi perkuliahan dan membuat tugas atau quiz secara manual.

Soal dapat berupa:

* Pilihan ganda
* Uraian/essay/isian

Untuk soal uraian, dosen dapat menentukan apakah siswa:

* Menjawab langsung menggunakan teks
* Mengupload PDF
* Menjawab menggunakan teks dan mengupload PDF

Contoh penggunaan PDF:

> Dosen memberikan soal uraian dan meminta mahasiswa mengerjakannya di buku tulis. Setelah selesai, mahasiswa memfoto/scan hasil pekerjaan kemudian menggabungkannya menjadi PDF dan mengupload PDF tersebut ke aplikasi.

Aplikasi juga memiliki sistem waktu sehingga dosen dapat menentukan:

* Waktu mulai
* Batas pengumpulan

Jika terjadi kendala teknis atau kondisi tertentu, dosen dapat mengubah waktu atau membuka kembali pengumpulan.

Identitas siswa tidak perlu dimasukkan secara manual ketika mengirim jawaban. Nama dan NIM otomatis diambil dari akun yang sedang login.

---

# 3. Tujuan Aplikasi

Aplikasi bertujuan untuk:

1. Menyediakan tempat penyimpanan materi perkuliahan.
2. Memudahkan dosen membuat tugas dan quiz.
3. Memudahkan mahasiswa mengerjakan tugas.
4. Mendukung soal pilihan ganda dan uraian.
5. Mendukung pengumpulan jawaban dalam bentuk PDF.
6. Mengatur waktu mulai dan deadline.
7. Mengetahui mahasiswa yang sudah dan belum mengumpulkan.
8. Memudahkan dosen memeriksa jawaban.
9. Menyimpan nilai mahasiswa.
10. Mengurangi kebutuhan pengumpulan tugas melalui WhatsApp/Telegram.

---

# 4. Role Pengguna

Aplikasi memiliki dua role utama:

## 4.1 Admin/Dosen

Admin/dosen dapat:

* Login
* Mengelola siswa
* Mengelola mata kuliah
* Mengunggah materi
* Membuat tugas/quiz
* Membuat soal
* Mengatur jenis soal
* Mengatur metode jawaban
* Mengatur waktu mulai
* Mengatur deadline
* Memperpanjang deadline
* Menunda tugas
* Membuka kembali tugas
* Melihat pengumpulan
* Melihat file jawaban
* Memeriksa jawaban
* Memberikan nilai
* Memberikan feedback

## 4.2 Siswa/Mahasiswa

Siswa dapat:

* Register/login
* Melihat mata kuliah
* Melihat materi
* Membaca materi
* Melihat tugas
* Mengerjakan quiz
* Memilih jawaban pilihan ganda
* Mengisi jawaban uraian
* Mengupload PDF
* Mengirim jawaban
* Melihat status pengumpulan
* Melihat nilai
* Melihat feedback dosen

---

# 5. Teknologi

## Frontend

```text
Next.js
TypeScript
React
Tailwind CSS
```

## Backend

Next.js dapat menangani:

* Server Components
* Server Actions
* Route Handlers/API
* Authentication flow
* Validasi
* Pengolahan submission

## Database

```text
Supabase PostgreSQL
```

## Authentication

```text
Supabase Auth
```

## File Storage

```text
Supabase Storage
```

Digunakan untuk:

* PDF materi
* PDF jawaban
* Foto
* Dokumen lainnya

## Deployment

```text
Vercel
```

---

# 6. Arsitektur Sistem

```text
                    USER
                     │
          ┌──────────┴──────────┐
          │                     │
       ADMIN                  SISWA
          │                     │
          └──────────┬──────────┘
                     │
                  NEXT.JS
                     │
          ┌──────────┴──────────┐
          │                     │
     SUPABASE AUTH        APPLICATION LOGIC
          │                     │
          └──────────┬──────────┘
                     │
            ┌────────┴─────────┐
            │                  │
       PostgreSQL           Storage
       Database             File
            │                  │
       Data aplikasi      PDF / Foto
```

---

# 7. Supabase

Supabase digunakan untuk dua kebutuhan utama:

## 7.1 PostgreSQL

Menyimpan data terstruktur:

* User
* Siswa
* Mata kuliah
* Materi
* Tugas
* Soal
* Pilihan jawaban
* Submission
* Jawaban
* Nilai
* Feedback
* Log perubahan

## 7.2 Supabase Storage

Menyimpan file:

```text
storage/
├── materials/
│   ├── course-id/
│   │   └── materi.pdf
│
├── submissions/
│   ├── student-id/
│   │   └── assignment-id/
│   │       └── jawaban.pdf
│
└── avatars/
    └── user-id/
        └── profile.jpg
```

Database hanya menyimpan path/file information.

---

# 8. Authentication

Supabase Auth digunakan untuk login.

Alur:

```text
Register/Login
      ↓
Supabase Auth
      ↓
Berhasil login
      ↓
Ambil profile user
      ↓
Cek role
      ↓
┌───────────────┬───────────────┐
│ Admin/Dosen   │ Siswa         │
│               │               │
│ /admin        │ /student      │
└───────────────┴───────────────┘
```

---

# 9. Data Profil User

Setiap user memiliki profile.

Contoh:

```text
Nama:
Ahmad

NIM:
2301005

Email:
ahmad@example.com

Role:
student
```

Untuk admin:

```text
Nama:
Dr. Budi

NIP:
198xxxxx

Email:
budi@example.com

Role:
admin
```

---

# 10. Identitas Siswa

Siswa tidak perlu memasukkan nama ketika mengirim jawaban.

Identitas diambil otomatis dari akun.

```text
Login
  ↓
User ID
  ↓
Student Profile
  ↓
Nama + NIM
  ↓
Submission
```

Contoh data:

```text
Nama       : Ahmad
NIM        : 2301005
Tugas      : Quiz Pemrograman Web
Waktu      : 09:42
Status     : Submitted
```

---

# 11. Mata Kuliah

Admin dapat membuat mata kuliah.

Data:

```text
id
name
code
description
created_at
```

Contoh:

```text
Nama:
Pemrograman Web

Kode:
IF203

Deskripsi:
Mata kuliah dasar pengembangan web.
```

---

# 12. Materi

Admin dapat mengunggah materi ke mata kuliah tertentu.

Data:

```text
id
course_id
title
description
file_path
file_type
file_size
created_by
created_at
```

Contoh:

```text
Pemrograman Web
│
├── Pertemuan 1 - HTML.pdf
├── Pertemuan 2 - CSS.pdf
├── Pertemuan 3 - JavaScript.pdf
└── Pertemuan 4 - DOM.pdf
```

Siswa dapat membuka materi tersebut.

---

# 13. Tugas/Quiz

Admin membuat tugas atau quiz.

Data:

```text
id
course_id
title
description
start_time
deadline
status
created_by
created_at
updated_at
```

Contoh:

```text
Quiz Pemrograman Web

Mulai:
01 Oktober 2026 08:00

Deadline:
01 Oktober 2026 10:00

Status:
Active
```

---

# 14. Status Tugas

Status tugas:

```text
draft
scheduled
active
paused
closed
```

### Draft

Belum dipublikasikan.

### Scheduled

Sudah dibuat tetapi belum waktunya dimulai.

### Active

Sedang dapat dikerjakan.

### Paused

Ditunda oleh dosen.

### Closed

Pengumpulan sudah ditutup.

---

# 15. Pengaturan Waktu

Admin menentukan:

```text
Waktu Mulai
Deadline
```

Contoh:

```text
Mulai:
08:00

Deadline:
10:00
```

Sistem menentukan status berdasarkan waktu.

```text
Sebelum 08:00
→ Belum dimulai

08:00 - 10:00
→ Aktif

Setelah 10:00
→ Ditutup
```

---

# 16. Perubahan Waktu

Admin dapat mengubah:

* Waktu mulai
* Deadline

Contoh:

```text
Deadline awal:
10:00

Terjadi gangguan

Deadline baru:
11:00
```

Sistem menggunakan deadline terbaru.

---

# 17. Penundaan Tugas

Jika terjadi kendala:

```text
Status:
Active

       ↓

Admin memilih:
Tunda Tugas

       ↓

Status:
Paused
```

Admin kemudian dapat menentukan waktu baru.

---

# 18. Membuka Kembali Tugas

Admin dapat membuka kembali tugas yang sudah ditutup.

Contoh:

```text
Tugas:
Quiz Pemrograman Web

Status:
Closed

Admin:
Open Again

Deadline:
12:00
```

---

# 19. Riwayat Perubahan

Sistem menyimpan riwayat perubahan.

Contoh:

```text
08:00
Tugas dimulai

09:30
Deadline:
10:00 → 11:00

11:00
Tugas ditutup
```

Data log:

```text
assignment_id
action
old_value
new_value
changed_by
created_at
```

---

# 20. Jenis Soal

Terdapat dua jenis soal utama:

```text
1. Pilihan Ganda
2. Uraian/Essay/Isian
```

---

# 21. Pilihan Ganda

Admin memasukkan:

* Pertanyaan
* Pilihan A
* Pilihan B
* Pilihan C
* Pilihan D
* Jawaban benar
* Nilai

Siswa melihat:

```text
Apa fungsi HTML?

○ Membuat struktur halaman web
○ Mengelola database
○ Mengatur server
○ Membuat sistem operasi
```

Input menggunakan:

```text
Radio Button
```

Karena siswa hanya memilih satu jawaban.

---

# 22. Pilihan Ganda Multi-Jawaban

Jika diperlukan, sistem dapat mendukung soal dengan lebih dari satu jawaban benar.

Input siswa:

```text
☐ HTML
☐ CSS
☐ JavaScript
☐ MySQL
```

Menggunakan:

```text
Checkbox
```

Fitur ini dapat dimasukkan sebagai pengembangan atau langsung disediakan pada versi awal.

---

# 23. Soal Uraian

Admin membuat pertanyaan:

```text
Jelaskan pengertian HTML!
```

Admin menentukan metode jawaban:

```text
Text
PDF
Text + PDF
```

---

# 24. Uraian Jawaban Teks

Siswa menjawab langsung:

```text
┌──────────────────────────────┐
│ HTML adalah ...              │
│                              │
│                              │
└──────────────────────────────┘
```

---

# 25. Uraian Jawaban PDF

Digunakan apabila dosen meminta siswa mengerjakan di buku.

Contoh instruksi:

```text
Kerjakan soal pada buku tulis.
Setelah selesai, scan atau foto hasil
pekerjaan dan kumpulkan dalam format PDF.
```

Siswa:

```text
[ Upload PDF ]

jawaban_algoritma.pdf

[ KIRIM JAWABAN ]
```

---

# 26. Uraian Text + PDF

Dosen dapat mengizinkan:

```text
Jawaban teks
+
Upload PDF
```

Contoh:

```text
Jawaban:
[ textarea ]

File:
[ Upload PDF ]
```

---

# 27. Validasi File

Sistem harus memvalidasi:

* Tipe file
* Ukuran file
* Nama file
* User yang mengupload

Contoh aturan:

```text
Format:
PDF

Ukuran maksimal:
10 MB
```

Batas tersebut dapat disesuaikan.

---

# 28. Submission

Ketika siswa mengirim jawaban, sistem membuat submission.

Data:

```text
id
assignment_id
student_id
submitted_at
status
score
feedback
```

Identitas siswa berasal dari:

```text
student_id
```

Bukan dari nama yang diketik siswa.

---

# 29. Answer

Setiap submission memiliki jawaban untuk setiap soal.

Data:

```text
id
submission_id
question_id
answer_text
file_path
score
feedback
```

Contoh:

```text
Submission
│
├── Soal 1
│    └── Jawaban: A
│
├── Soal 2
│    └── Jawaban: HTML adalah...
│
└── Soal 3
     └── File: jawaban.pdf
```

---

# 30. Pengumpulan Jawaban

Sebelum mengirim:

```text
Apakah Anda yakin ingin mengirim jawaban?

[ BATAL ]    [ KIRIM ]
```

Setelah dikirim:

```text
Status:
Sudah Dikumpulkan

Waktu:
09:42
```

---

# 31. Deadline

Jika waktu sudah melewati deadline:

```text
Deadline:
10:00

Sekarang:
10:05
```

Maka:

```text
Pengumpulan ditutup.
```

Siswa tidak dapat mengirim jawaban baru.

Jika admin memperpanjang deadline:

```text
10:00 → 11:00
```

siswa dapat kembali mengirim selama masih dalam waktu yang diperbolehkan.

---

# 32. Dashboard Admin

Dashboard menampilkan:

```text
Total Siswa
Total Mata Kuliah
Total Materi
Total Tugas

Jawaban Terkumpul
Jawaban Belum Dinilai
```

---

# 33. Daftar Pengumpulan

Contoh:

| Nama  | NIM     | Status    | Waktu | Nilai |
| ----- | ------- | --------- | ----- | ----- |
| Ahmad | 2301005 | Terkumpul | 09:42 | 85    |
| Budi  | 2301006 | Terkumpul | 09:51 | 90    |
| Citra | 2301007 | Belum     | -     | -     |

Admin dapat membuka submission siswa.

---

# 34. Pemeriksaan Pilihan Ganda

Pilihan ganda dapat diperiksa otomatis.

Contoh:

```text
Jawaban siswa:
A

Jawaban benar:
A

Nilai:
10/10
```

---

# 35. Pemeriksaan Uraian

Jawaban uraian diperiksa oleh dosen.

Untuk PDF:

```text
Nama:
Ahmad

NIM:
2301005

File:
jawaban_ahmad.pdf

[ Buka PDF ]

Nilai:
[ 85 ]

Feedback:
Jawaban sudah benar.
```

---

# 36. Nilai

Nilai pilihan ganda dapat dihitung otomatis.

Nilai uraian diberikan oleh dosen.

Contoh:

```text
Pilihan Ganda:
60

Uraian:
25

Nilai Akhir:
85
```

---

# 37. Dashboard Siswa

Menampilkan:

```text
Mata Kuliah
Materi
Tugas Aktif
Tugas Selesai
Nilai
```

---

# 38. Status Tugas Siswa

Contoh:

```text
Quiz Pemrograman Web

Mulai:
08:00

Deadline:
10:00

Status:
Belum Dikerjakan

[ MULAI ]
```

Setelah dikumpulkan:

```text
Status:
Sudah Dikumpulkan

Waktu:
09:42
```

Setelah dinilai:

```text
Nilai:
85

[ Lihat Hasil ]
```

---

# 39. Struktur Database

## users/profiles

```text
id
name
nim
email
role
avatar_url
created_at
updated_at
```

Role:

```text
admin
student
```

---

## courses

```text
id
name
code
description
created_by
created_at
updated_at
```

---

## materials

```text
id
course_id
title
description
file_path
file_name
file_type
file_size
created_by
created_at
updated_at
```

---

## assignments

```text
id
course_id
title
description
start_time
deadline
status
created_by
created_at
updated_at
```

---

## questions

```text
id
assignment_id
question_text
question_type
answer_method
score
order_number
created_at
updated_at
```

question_type:

```text
multiple_choice
essay
```

answer_method:

```text
text
pdf
text_and_pdf
```

---

## question_options

```text
id
question_id
option_text
option_key
is_correct
```

Contoh:

```text
A | HTML | true
B | CSS | false
C | PHP | false
D | MySQL | false
```

---

## submissions

```text
id
assignment_id
student_id
submitted_at
status
total_score
feedback
created_at
updated_at
```

---

## answers

```text
id
submission_id
question_id
answer_text
file_path
score
feedback
created_at
updated_at
```

---

## assignment_logs

```text
id
assignment_id
action
old_value
new_value
changed_by
created_at
```

---

# 40. Storage Bucket

Supabase Storage dapat memiliki bucket:

```text
learning-materials
```

Untuk materi:

```text
materials/{course_id}/{material_id}/file.pdf
```

Dan bucket:

```text
student-submissions
```

Untuk jawaban siswa:

```text
submissions/{student_id}/{assignment_id}/{answer_id}.pdf
```

Struktur ini membuat file lebih mudah dikelola.

---

# 41. Keamanan Storage

File jawaban siswa sebaiknya tidak dibuat bebas diakses publik.

Gunakan:

```text
Private Bucket
```

Admin/dosen mendapatkan akses melalui mekanisme yang terkontrol.

Untuk file yang hanya boleh dilihat oleh pengguna tertentu, gunakan URL yang memiliki masa berlaku terbatas atau mekanisme akses server-side.

---

# 42. Keamanan Database

Gunakan Supabase Row Level Security (RLS).

Contoh aturan:

### Siswa

Siswa hanya dapat:

* Melihat materi yang memang tersedia untuknya.
* Melihat tugas yang tersedia.
* Membuat submission miliknya sendiri.
* Melihat submission miliknya sendiri.
* Melihat nilainya sendiri.

Siswa tidak dapat:

* Melihat submission siswa lain.
* Mengubah nilai.
* Mengubah soal.
* Mengubah deadline.

### Admin

Admin dapat:

* Membuat materi.
* Membuat tugas.
* Membuat soal.
* Melihat submission.
* Memeriksa jawaban.
* Memberikan nilai.
* Mengubah deadline.

---

# 43. Struktur Folder Next.js

Contoh struktur:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── materials/
│   │   ├── assignments/
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   └── submissions/
│   │
│   ├── student/
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── materials/
│   │   ├── assignments/
│   │   │   └── [id]/
│   │   └── results/
│   │
│   ├── api/
│   │   ├── assignments/
│   │   ├── materials/
│   │   ├── submissions/
│   │   └── grades/
│   │
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── admin/
│   ├── student/
│   ├── quiz/
│   └── forms/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validations/
│   └── utils/
│
├── types/
│   ├── user.ts
│   ├── course.ts
│   ├── assignment.ts
│   └── submission.ts
│
└── middleware.ts
```

---

# 44. Halaman Admin

```text
/admin
/admin/dashboard
/admin/students
/admin/courses
/admin/courses/[id]
/admin/materials
/admin/assignments
/admin/assignments/create
/admin/assignments/[id]
/admin/assignments/[id]/edit
/admin/assignments/[id]/submissions
/admin/submissions/[id]
```

---

# 45. Halaman Siswa

```text
/student
/student/dashboard
/student/courses
/student/courses/[id]
/student/materials/[id]
/student/assignments
/student/assignments/[id]
/student/assignments/[id]/result
/student/results
```

---

# 46. Alur Admin

```text
Login
  ↓
Dashboard
  ↓
Buat Mata Kuliah
  ↓
Upload Materi
  ↓
Buat Tugas
  ↓
Tambah Soal
  ↓
Pilih Jenis Soal
  │
  ├── Pilihan Ganda
  │
  └── Uraian
         │
         ├── Text
         ├── PDF
         └── Text + PDF
  ↓
Atur Waktu Mulai
  ↓
Atur Deadline
  ↓
Publikasikan
  ↓
Pantau Pengumpulan
  ↓
Periksa Jawaban
  ↓
Berikan Nilai
```

---

# 47. Alur Siswa

```text
Login
  ↓
Dashboard
  ↓
Pilih Mata Kuliah
  ↓
Baca Materi
  ↓
Lihat Tugas
  ↓
Tunggu Waktu Mulai
  ↓
Mulai Tugas
  ↓
Kerjakan Soal
  │
  ├── Pilihan Ganda
  │
  └── Uraian
         │
         ├── Teks
         └── Upload PDF
  ↓
Kirim Jawaban
  ↓
Sistem mencatat:
Nama + NIM + Waktu
  ↓
Menunggu Pemeriksaan
  ↓
Nilai Keluar
```

---

# 48. Alur Upload PDF

```text
Siswa memilih file
       ↓
Validasi format
       ↓
Validasi ukuran
       ↓
Upload ke Supabase Storage
       ↓
Storage menghasilkan file path
       ↓
Path disimpan ke database
       ↓
Jawaban tersimpan
```

---

# 49. Alur Ketika Terjadi Kendala

```text
Tugas Aktif
     ↓
Terjadi kendala
     ↓
Admin membuka pengaturan
     ↓
Pilih:
- Perpanjang waktu
- Tunda
- Buka kembali
     ↓
Simpan perubahan
     ↓
Sistem menggunakan pengaturan terbaru
```

---

# 50. Fitur MVP

Versi pertama aplikasi dapat mencakup:

## Admin

* Login
* Dashboard
* Kelola siswa
* Kelola mata kuliah
* Upload materi
* Buat tugas
* Buat pilihan ganda
* Buat soal uraian
* Upload requirement PDF
* Atur waktu mulai
* Atur deadline
* Ubah deadline
* Lihat pengumpulan
* Lihat PDF jawaban
* Koreksi jawaban
* Berikan nilai

## Siswa

* Register
* Login
* Dashboard
* Melihat mata kuliah
* Membaca materi
* Melihat tugas
* Mengerjakan pilihan ganda
* Mengerjakan uraian
* Upload PDF
* Mengirim jawaban
* Melihat status
* Melihat nilai

---

# 51. Fitur Pengembangan Selanjutnya

Setelah MVP selesai, dapat ditambahkan:

* Notifikasi tugas
* Notifikasi deadline
* Notifikasi nilai
* Timer pengerjaan
* Rekap nilai
* Export nilai ke Excel
* Pencarian siswa
* Filter kelas
* Pengumuman dosen
* Komentar pada jawaban
* Pembukaan tugas untuk siswa tertentu
* Riwayat aktivitas
* Absensi
* Diskusi materi
* Multiple-choice multi-answer
* Statistik hasil quiz

---

# 52. Ringkasan Teknologi

```text
Frontend
└── Next.js + TypeScript
        │
        ├── React
        └── Tailwind CSS

Backend
└── Next.js
        │
        ├── Server Actions
        ├── Route Handlers
        └── Server Components

Authentication
└── Supabase Auth

Database
└── Supabase PostgreSQL

File Storage
└── Supabase Storage

Security
└── Supabase RLS

Deployment
└── Vercel
```

---

# 53. Konsep Akhir Aplikasi

```text
                 APLIKASI PEMBELAJARAN
                         │
          ┌──────────────┴──────────────┐
          │                             │
       DOSEN                          SISWA
          │                             │
     Buat Materi                    Baca Materi
          │                             │
     Buat Tugas                     Lihat Tugas
          │                             │
     Buat Soal                      Kerjakan
          │                             │
     Atur Waktu                         │
          │                             │
          └──────────────┬──────────────┘
                         ↓
                  PENGUMPULAN
                         │
             ┌───────────┴───────────┐
             │                       │
       Pilihan Ganda             Uraian
       Radio Button                  │
                                     ├── Text
                                     └── PDF
                                          │
                                    Buku Tulis
                                          ↓
                                    Scan/Foto
                                          ↓
                                       PDF
                                          ↓
                                      Upload
                         │
                         ↓
                  DOSEN MEMERIKSA
                         │
                         ↓
                       NILAI
                         │
                         ↓
                   SISWA MELIHAT
```

## Kesimpulan

Aplikasi ini pada dasarnya menjadi **sistem pembelajaran dan pengumpulan tugas perkuliahan**.

Dosen memiliki kontrol terhadap **materi, soal, jenis jawaban, waktu mulai, deadline, dan penilaian**.

Siswa cukup menggunakan akun masing-masing. Karena identitas berasal dari login, setiap jawaban otomatis tercatat berdasarkan **nama dan NIM siswa**, sehingga siswa tidak perlu mengetik identitas setiap kali mengumpulkan.

**Next.js** menangani aplikasi web, **Supabase PostgreSQL** menyimpan data aplikasi, **Supabase Auth** menangani login, dan **Supabase Storage** menyimpan file seperti materi PDF dan PDF jawaban siswa.
