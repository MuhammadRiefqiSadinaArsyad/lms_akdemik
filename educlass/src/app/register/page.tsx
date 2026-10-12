import { redirect } from "next/navigation";

/**
 * Pendaftaran mandiri dinonaktifkan.
 * Akun mahasiswa dibuatkan oleh dosen/admin di halaman /admin/students.
 */
export default function RegisterPage() {
  redirect("/login");
}
