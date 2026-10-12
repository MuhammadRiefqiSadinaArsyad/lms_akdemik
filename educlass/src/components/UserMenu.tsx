"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";
import { IconChevron, IconLogout, IconUser } from "./NavIcons";

export function UserMenu({
  name,
  sub,
  accountHref = "/account",
  align = "right",
}: {
  name: string;
  sub: string;
  accountHref?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open ]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu akun"
        className={cn(
          "flex items-center gap-2.5 border py-1.5 pl-1.5 pr-2.5 transition-colors duration-200 active:scale-[0.97]",
          open
            ? "border-foreground bg-panel"
            : "border-line-strong bg-panel hover:border-foreground",
        )}
      >
        <Avatar name={name} className="h-8 w-8 border-line bg-background" />
        <span className="hidden max-w-28 text-left min-[480px]:block">
          <span className="block truncate text-[13px] font-medium leading-tight">
            {name}
          </span>
          <span className="block truncate text-[11px] leading-tight text-muted">
            {sub}
          </span>
        </span>
        <span
          className={cn(
            "text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <IconChevron size={14} />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          onClick={close}
          className={cn(
            "absolute z-40 mt-2 w-60 border border-line bg-panel shadow-[0_16px_40px_rgba(27,25,21,0.14)] fade-up",
            align === "left" ? "left-0" : "right-0",
          )}
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{sub}</p>
          </div>
          <div className="p-1.5">
            <Link
              href={accountHref}
              role="menuitem"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.06]"
            >
              <span className="text-muted">
                <IconUser size={16} />
              </span>
              Pengaturan akun
            </Link>
            <a
              href="/logout"
              role="menuitem"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.06]"
            >
              <span className="text-muted">
                <IconLogout size={16} />
              </span>
              Keluar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
