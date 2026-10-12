import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { NavLink } from "@/components/NavLink";
import { MobileMenu } from "@/components/MobileMenu";
import { UserMenu } from "@/components/UserMenu";
import { HeaderShadow } from "@/components/HeaderShadow";
import {
  IconBook,
  IconGrid,
  IconInbox,
  IconLayers,
  IconTask,
  IconUsers,
} from "@/components/NavIcons";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <IconGrid />, index: "01" },
  { href: "/admin/students", label: "Siswa", icon: <IconUsers />, index: "02" },
  { href: "/admin/courses", label: "Mata Kuliah", icon: <IconBook />, index: "03" },
  { href: "/admin/materials", label: "Materi", icon: <IconLayers />, index: "04" },
  { href: "/admin/assignments", label: "Tugas", icon: <IconTask />, index: "05" },
  { href: "/admin/submissions", label: "Pengumpulan", icon: <IconInbox />, index: "06" },
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
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-line bg-panel lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
        <div>
          <Link href="/admin/dashboard" aria-label="EduClass — Dashboard dosen">
            <span className="block font-serif text-[26px] leading-none">EduClass</span>
            <span className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted">
              Panel Dosen
              <span className="h-px flex-1 bg-line" aria-hidden />
            </span>
          </Link>
          <nav aria-label="Navigasi utama" className="mt-10 space-y-1.5">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                variant="side"
                icon={l.icon}
                index={l.index}
              />
            ))}
          </nav>
        </div>
        <div className="mt-10 border-t border-line pt-5">
          <UserMenu name={user.name} sub="Dosen · Admin" align="left" />
          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted">
            © {new Date().getFullYear()} EduClass
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-background transition-shadow duration-300 lg:hidden">
          {/* solid (tanpa backdrop-blur): blur menjebak overlay fixed drawer menjadi setinggi header */}
          <HeaderShadow />
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              href="/admin/dashboard"
              className="flex min-w-0 items-baseline gap-2.5 transition-opacity duration-200 hover:opacity-70"
              aria-label="EduClass — Dashboard dosen"
            >
              <span className="font-serif text-[22px] leading-none">EduClass</span>
              <span className="hidden border-l border-line-strong pl-2.5 text-[10px] uppercase tracking-[0.22em] text-muted min-[480px]:block">
                Panel Dosen
              </span>
            </Link>
            <MobileMenu links={links} userName={user.name} userSub="Dosen · Admin" />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">{children}</main>
      </div>
    </div>
  );
}
