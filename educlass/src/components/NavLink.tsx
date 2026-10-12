"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  variant,
  icon,
  index,
}: {
  href: string;
  label: string;
  variant: "side" | "bar" | "drawer";
  icon?: ReactNode;
  index?: string;
}) {
  const path = usePathname();
  const active = path === href || path.startsWith(href + "/");

  if (variant === "bar") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-2 px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-px active:scale-[0.97]",
          active
            ? "bg-foreground font-medium text-background"
            : "text-muted hover:bg-foreground/[0.06] hover:text-foreground",
        )}
      >
        {index ? (
          <span
            className={cn(
              "text-[10px] font-normal tracking-[0.14em]",
              active ? "text-background/60" : "text-muted/70",
            )}
          >
            {index}
          </span>
        ) : null}
        {icon}
        <span className="whitespace-nowrap">{label}</span>
      </Link>
    );
  }

  if (variant === "drawer") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex min-w-0 items-center gap-3 border-b border-line px-1 py-4 transition-colors duration-200 active:scale-[0.99]",
          active ? "text-foreground" : "text-muted hover:text-foreground",
        )}
      >
        {index ? (
          <span className="w-7 shrink-0 font-serif text-sm italic text-muted">
            {index}
          </span>
        ) : null}
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-200",
            active
              ? "border-foreground bg-foreground text-background"
              : "border-line-strong text-muted group-hover:border-foreground group-hover:text-foreground",
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 font-serif text-xl leading-snug",
            active && "font-medium",
          )}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "ml-auto transition-transform duration-200",
            active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
          )}
        >
          →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 border px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.98]",
        active
          ? "border-foreground bg-foreground font-medium text-background"
          : "border-transparent text-muted hover:border-line-strong hover:text-foreground",
      )}
    >
      {index ? (
        <span
          className={cn(
            "text-[10px] tracking-[0.14em]",
            active ? "text-background/60" : "text-muted/60",
          )}
        >
          {index}
        </span>
      ) : null}
      {icon}
      <span>{label}</span>
      <span aria-hidden className={cn("ml-auto", active ? "opacity-100" : "opacity-0")}>
        →
      </span>
    </Link>
  );
}
