import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { NavLink } from "@/components/NavLink";
import { MobileMenu } from "@/components/MobileMenu";
import { UserMenu } from "@/components/UserMenu";
import { HeaderShadow } from "@/components/HeaderShadow";
import { IconBook, IconGrade, IconHome, IconTask } from "@/components/NavIcons";

const links = [
  { href: "/student/dashboard", label: "Beranda", icon: <IconHome />, index: "01" },
  { href: "/student/courses", label: "Mata Kuliah", icon: <IconBook />, index: "02" },
  { href: "/student/assignments", label: "Tugas", icon: <IconTask />, index: "03" },
  { href: "/student/results", label: "Nilai", icon: <IconGrade />, index: "04" },
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
      <header className="sticky top-0 z-20 border-b border-line bg-background transition-shadow duration-300 md:bg-background/90 md:backdrop-blur">
        {/* solid di mobile: backdrop-blur menjebak overlay fixed drawer menjadi setinggi header */}
        <HeaderShadow />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/student/dashboard"
            className="flex shrink-0 items-baseline gap-2.5 transition-opacity duration-200 hover:opacity-70"
            aria-label="EduClass — Beranda"
          >
            <span className="font-serif text-[22px] leading-none">EduClass</span>
            <span className="hidden border-l border-line-strong pl-2.5 text-[10px] uppercase tracking-[0.22em] text-muted min-[480px]:block">
              LMS Akademik
            </span>
          </Link>
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 border border-line bg-panel p-1 md:flex"
          >
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                variant="bar"
                icon={l.icon}
                index={l.index}
              />
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block">
              <UserMenu name={user.name} sub={`NIM ${user.nim}`} />
            </div>
            <MobileMenu
              links={links}
              userName={user.name}
              userSub={`NIM ${user.nim}`}
              className="md:hidden"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">{children}</main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
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
