import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Avatar } from "@/components/ui";
import { NavLink } from "@/components/NavLink";

const links = [
  { href: "/student/dashboard", label: "Beranda" },
  { href: "/student/courses", label: "Mata Kuliah" },
  { href: "/student/assignments", label: "Tugas" },
  { href: "/student/results", label: "Nilai" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/student/dashboard" className="font-serif text-xl">
            EduClass
          </Link>
          <nav className="flex items-center gap-8 text-sm">
            {links.map((l) => (
              <span key={l.href} className="hidden sm:block">
                <NavLink href={l.href} label={l.label} variant="bar" />
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="mt-1 text-xs text-muted">NIM {user.nim}</p>
            </div>
            <Avatar name={user.name} />
          </div>
        </div>
        <nav className="flex gap-5 overflow-x-auto border-t border-line px-6 text-sm sm:hidden">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} variant="bar" />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-14">{children}</main>
      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-line px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-muted">
        <span>© {new Date().getFullYear()} EduClass</span>
        <div className="flex items-center gap-5">
          <Link href="/account" className="u-link">
            Akun
          </Link>
          <a href="/logout" className="u-link">
            Keluar
          </a>
        </div>
      </footer>
    </div>
  );
}