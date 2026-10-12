import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Avatar } from "@/components/ui";
import { NavLink } from "@/components/NavLink";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/students", label: "Siswa" },
  { href: "/admin/courses", label: "Mata Kuliah" },
  { href: "/admin/materials", label: "Materi" },
  { href: "/admin/assignments", label: "Tugas" },
  { href: "/admin/submissions", label: "Pengumpulan" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-panel lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:overflow-y-auto lg:px-6 lg:py-8">
        <div>
          <Link href="/admin/dashboard" className="block font-serif text-2xl">
            EduClass
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted">
            Panel Dosen
          </p>
          <nav className="mt-12 space-y-1">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} variant="side" />
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div>
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="mt-1 text-xs text-muted">Dosen</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account" className="u-link text-sm text-muted">
              Akun
            </Link>
            <a href="/logout" className="u-link text-sm text-muted">
              Keluar
            </a>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/admin/dashboard" className="font-serif text-xl">
              EduClass
            </Link>
            <div className="flex items-center gap-3">
              <p className="text-sm">{user.name}</p>
              <Avatar name={user.name} />
            </div>
          </div>
          <nav className="flex gap-5 overflow-x-auto border-t border-line px-6 text-sm">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} variant="bar" />
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">{children}</main>
      </div>
    </div>
  );
}