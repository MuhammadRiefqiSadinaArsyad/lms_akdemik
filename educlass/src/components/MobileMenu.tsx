"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";
import { NavLink } from "./NavLink";
import { IconLogout, IconUser } from "./NavIcons";

export type MenuLink = {
  href: string;
  label: string;
  icon?: ReactNode;
  index?: string;
};

const EXIT_MS = 220;

export function MobileMenu({
  links,
  userName,
  userSub,
  accountHref = "/account",
  className,
}: {
  links: MenuLink[];
  userName: string;
  userSub: string;
  accountHref?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | null>(null);

  const close = useCallback(() => {
    if (!open) return;
    setOpen(false);
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, EXIT_MS);
  }, [open ]);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setLeaving(false);
    setMounted(true);
    setOpen(true);
  }, [open, close]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  // Kunci scroll body + tutup dengan Escape selama drawer tampil
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted, close]);

  return (
    <div className={cn("shrink-0", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className={cn(
          "group relative z-[60] inline-flex h-11 w-11 items-center justify-center border transition-all duration-300 ease-out active:scale-90",
          open
            ? "border-foreground bg-foreground text-background"
            : "border-line-strong bg-panel text-foreground hover:border-foreground",
        )}
      >
        <span className="relative block h-4 w-5" aria-hidden>
          <span
            className={cn(
              "absolute left-0 h-0.5 bg-current transition-all duration-300 ease-out",
              open ? "top-[7px] w-full rotate-45" : "top-0 w-full group-hover:w-3/4",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-[7px] h-0.5 bg-current transition-all delay-75 duration-300 ease-out",
              open ? "w-0 opacity-0" : "w-full opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-0.5 bg-current transition-all delay-100 duration-300 ease-out",
              open ? "bottom-[7px] w-full -rotate-45" : "bottom-0 w-3/4 group-hover:w-full",
            )}
          />
        </span>
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={close}
            className={cn(
              "absolute inset-0 cursor-default bg-black/50",
              leaving ? "fade-out" : "fade-in",
            )}
          />
          <div
            className={cn(
              "absolute right-0 top-0 flex h-full w-[320px] max-w-[85vw] flex-col overflow-x-clip border-l border-line bg-panel shadow-[-24px_0_48px_rgba(27,25,21,0.18)]",
              leaving ? "drawer-out" : "drawer-in",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line py-4 pl-5 pr-20">
              <div>
                <p className="font-serif text-xl leading-none">EduClass</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted">
                  Menu
                </p>
              </div>
            </div>

            <nav
              aria-label="Navigasi utama"
              onClick={close}
              className="min-h-0 flex-1 overflow-x-clip overflow-y-auto px-5 py-2"
            >
              {links.map((l, i) => (
                <div
                  key={l.href}
                  style={leaving ? undefined : { animationDelay: `${Math.min(i, 5) * 60}ms` }}
                  className={cn(!leaving && "fade-up")}
                >
                  <NavLink
                    href={l.href}
                    label={l.label}
                    variant="drawer"
                    icon={l.icon}
                    index={l.index}
                  />
                </div>
              ))}
            </nav>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={userName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium leading-tight">{userName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{userSub}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2" onClick={close}>
                <Link
                  href={accountHref}
                  className="flex items-center justify-center gap-2 border border-line-strong px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.97]"
                >
                  <IconUser size={15} />
                  Akun
                </Link>
                <a
                  href="/logout"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] text-muted transition-colors hover:text-foreground active:scale-[0.97]"
                >
                  <IconLogout size={15} />
                  Keluar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
