
# UI/UX DESIGN PROMPT — APLIKASI PEMBELAJARAN

Gunakan gambar referensi yang saya lampirkan sebagai REFERENSI UTAMA untuk
gaya visual dan layout.

PENTING:

- Jangan membuat desain dashboard modern generik.
- Jangan menggunakan card berlebihan.
- Jangan menggunakan gradient berlebihan.
- Jangan membuat UI yang terlalu ramai.
- Pertahankan kesan editorial, minimalis, elegan, clean, dan premium seperti
  gambar referensi.
- Jangan menyalin logo, nama brand, foto, atau identitas dari gambar referensi.
- Ambil INSPIRASI dari layout, proporsi, spacing, typography, dan visual style-nya.

==================================================
PROJECT
=======

Saya sedang membuat aplikasi web pembelajaran perkuliahan.

Tech stack:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage

Aplikasi memiliki 2 role:

1. Admin/Dosen
2. Siswa/Mahasiswa

==================================================
DESIGN DIRECTION
================

Gunakan visual style seperti gambar referensi:

- Minimalist editorial
- Elegant
- Clean
- Premium
- Banyak whitespace
- Background warm white / off-white
- Warna utama hitam dan putih
- Border tipis
- Typography yang elegan
- Layout yang seimbang
- Foto/visual besar sebagai elemen utama
- Hindari UI yang terlalu rounded
- Hindari shadow yang berat
- Hindari terlalu banyak warna
- Gunakan animasi yang subtle dan smooth

Overall feeling:

"Modern academic platform with editorial fashion-magazine aesthetics."

Bukan seperti:

- Admin template biasa
- Bootstrap dashboard
- SaaS template generik
- Material Design
- Dashboard penuh card

==================================================
LOGIN PAGE
==========

Buat halaman login dengan layout split-screen seperti referensi.

Desktop:

- Container memenuhi sebagian besar viewport
- Panel kiri sekitar 45%
- Panel kanan sekitar 55%

PANEL KIRI:

Background:

- warm white / ivory

Isi:

Logo aplikasi di bagian atas.

Gunakan nama sementara:

"EduClass"

Subtitle:

"Learning & Assessment Platform"

Kemudian:

"Welcome back."

Subheading:

"Masuk untuk melanjutkan pembelajaranmu."

Form:

Email / NIM
[ Masukkan email atau NIM ]

Password
[ Masukkan password ]

Di bawahnya:

[ ] Ingat saya

                    Lupa password?

Primary button:

[ Masuk → ]

Kemudian separator:

──────────── ATAU ────────────

Secondary button:

[ G  Masuk dengan Google ]

Bagian bawah:

"Belum punya akun?"
"Daftar di sini →"

PANEL KANAN:

Gunakan gambar/visual bertema mahasiswa dan perkuliahan.

Visual harus memenuhi seluruh panel kanan.

Gunakan image dengan:

- mahasiswa belajar
- laptop
- buku
- suasana kampus modern
- natural lighting
- cinematic photography
- editorial photography
- muted tones
- realistic photography

Tambahkan overlay text di bagian bawah:

"Learn.
Practice.
Submit."

Subtext:

"Semua materi dan tugas perkuliahan
dalam satu tempat."

Tambahkan navigasi kecil di bagian atas:

Beranda
Bantuan
Bahasa

==================================================
TYPOGRAPHY
==========

Gunakan kombinasi typography:

Heading:

- serif editorial
- elegant
- high contrast

Body:

- clean sans-serif

Heading seperti:

"Welcome back."

harus besar, elegant, dan menjadi focal point.

Jangan menggunakan font yang terlihat seperti gaming,
tech startup, atau overly futuristic.

==================================================
DASHBOARD SISWA
===============

Setelah login, siswa masuk ke dashboard.

Pertahankan design language dari login page.

Layout:

Sidebar minimal atau top navigation.

Header:

"Good morning, Ahmad."

Subheading:

"Continue your learning journey."

Tampilkan informasi:

Mata kuliah
Tugas aktif
Tugas selesai
Nilai

Namun jangan membuat semuanya menjadi card besar.

Gunakan layout editorial dengan whitespace yang cukup.

Section:

"Your Courses"

Tampilkan mata kuliah dalam layout clean.

Contoh:

Pemrograman Web
IF203
12 Materi
3 Tugas

Basis Data
IF204
8 Materi
2 Tugas

==================================================
HALAMAN MATERI
==============

Tampilan harus minimalis.

Header:

"Pemrograman Web"

Description:

"Materi perkuliahan"

Daftar materi:

01
HTML Dasar
PDF
Pertemuan 1

02
CSS Dasar
PDF
Pertemuan 2

03
JavaScript
PDF
Pertemuan 3

Gunakan typography dan whitespace seperti editorial layout.

Jangan gunakan grid card yang terlalu ramai.

==================================================
HALAMAN TUGAS / QUIZ
====================

Tampilan harus fokus pada soal.

Header:

"Quiz Pemrograman Web"

Informasi:

Mulai:
08:00 — 06 October 2026

Deadline:
10:00 — 06 October 2026

Status:
Active

Tampilkan countdown secara subtle.

Soal:

01

Apa fungsi utama HTML?

○ Membuat struktur halaman web
○ Mengelola database
○ Membuat server
○ Mengatur jaringan

Gunakan RADIO BUTTON untuk pilihan ganda.

==================================================
SOAL URAIAN
===========

Untuk soal uraian:

02

"Jelaskan pengertian HTML dan berikan contoh
penggunaannya."

Jika jawaban berupa teks:

textarea minimalis.

Jika dosen meminta upload PDF:

Tampilkan area upload yang clean:

"Upload your answer"

"Kerjakan soal pada buku tulis kemudian
scan/foto dan kumpulkan dalam bentuk PDF."

[ Upload PDF ]

Tampilkan nama file setelah upload.

Contoh:

✓ jawaban_html.pdf

==================================================
SUBMISSION
==========

Sebelum submit:

"Ready to submit?"

"Pastikan seluruh jawaban sudah benar sebelum
mengirim."

Button:

"Submit Answer →"

Identitas siswa TIDAK perlu diketik.

Nama dan NIM otomatis berasal dari akun login.

Contoh:

Student
Ahmad
2301005

==================================================
HALAMAN ADMIN / DOSEN
=====================

Buat dashboard admin dengan design language yang sama.

Admin dapat:

- Mengelola siswa
- Mengelola mata kuliah
- Mengupload materi
- Membuat tugas
- Membuat soal
- Mengatur waktu
- Melihat submission
- Memeriksa jawaban
- Memberikan nilai

Header:

"Good morning, Lecturer."

Section:

"Overview"

Statistik:

Students
Courses
Assignments
Submissions

Gunakan typography besar dan whitespace.

Jangan membuat dashboard terlihat seperti template admin
yang penuh card.

==================================================
CREATE ASSIGNMENT
=================

Admin dapat membuat tugas.

Fields:

Title
Description
Course

Start Date
Start Time

Deadline Date
Deadline Time

Status

Kemudian:

"Questions"

Admin dapat menambahkan soal.

Question Type:

[ Multiple Choice ]
[ Essay ]

Jika Multiple Choice:

Question
Option A
Option B
Option C
Option D
Correct Answer
Score

Gunakan radio button untuk menentukan correct answer.

Jika Essay:

Question
Answer Method:

( ) Text
( ) PDF
( ) Text + PDF

Score

==================================================
SUBMISSION MANAGEMENT
=====================

Admin dapat melihat:

Student
NIM
Assignment
Submitted At
Status
Score

Contoh:

Ahmad
2301005
Quiz Pemrograman Web
09:42
Submitted
85

Admin dapat membuka submission.

Untuk PDF:

[ View PDF ]

[ Download ]

Admin dapat memberikan:

Score
Feedback

==================================================
TIME MANAGEMENT
===============

Admin dapat:

- Mengatur waktu mulai
- Mengatur deadline
- Memperpanjang deadline
- Menunda tugas
- Membuka kembali tugas

Jika terjadi error atau kendala:

Original deadline:
10:00

New deadline:
11:00

Tampilkan perubahan secara jelas.

==================================================
RESPONSIVE DESIGN
=================

Desktop:

Gunakan split layout seperti referensi.

Tablet:

Kurangi ukuran visual dan spacing.

Mobile:

Jangan mempertahankan split-screen secara paksa.

Pada mobile:

1. Form/login
2. Visual image

atau image dapat dipindahkan menjadi banner pendek.

Pastikan seluruh halaman nyaman digunakan di mobile.

==================================================
ANIMATION
=========

Gunakan animasi minimal dan elegan.

Contoh:

- Fade in
- Subtle slide
- Image reveal
- Hover underline
- Smooth page transition

Durasi sekitar 200–500ms.

Jangan menggunakan:

- excessive bouncing
- flashy animation
- parallax berlebihan
- spinning animation

==================================================
IMPORTANT UI RULES
==================

1. Gunakan whitespace yang banyak.
2. Gunakan typography sebagai elemen visual utama.
3. Gunakan border tipis.
4. Gunakan warna netral.
5. Gunakan foto besar sebagai visual.
6. Hindari card berlebihan.
7. Hindari gradient berlebihan.
8. Hindari rounded corner yang terlalu besar.
9. Jangan membuat UI terlihat seperti template SaaS.
10. Semua halaman harus memiliki design language yang konsisten.

==================================================
IMPLEMENTATION
==============

Implementasikan menggunakan:

Next.js + TypeScript + Tailwind CSS.

Gunakan reusable components.

Contoh:

components/
├── ui/
├── auth/
├── layout/
├── dashboard/
├── quiz/
├── assignment/
├── material/
├── submission/
└── admin/

Buat komponen yang reusable dan maintainable.

Gunakan responsive design.

Pastikan UI dapat digunakan dengan keyboard dan memiliki
accessibility dasar.

==================================================
IMPORTANT
=========

Jangan hanya membuat halaman login.

Buat design system yang nantinya dapat digunakan untuk:

- Login
- Register
- Student Dashboard
- Admin Dashboard
- Course
- Material
- Assignment
- Quiz
- Submission
- Grading
- Profile

Semua halaman harus terasa sebagai SATU aplikasi.

Prioritas desain:

1. Visual hierarchy
2. Typography
3. Whitespace
4. Layout
5. Usability
6. Responsive
7. Animation

Gunakan gambar referensi yang saya lampirkan sebagai
referensi visual utama untuk keseluruhan design system.
