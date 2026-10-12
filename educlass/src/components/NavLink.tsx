"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "side" | "bar";
}) {
  const path = usePathname();
  const active = path === href || path.startsWith(href + "/");

  if (variant === "bar") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative shrink-0 whitespace-nowrap px-1 py-3 text-sm transition-all duration-200 active:scale-95",
          active
            ? "font-medium text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block border-l-2 py-2 pl-4 text-sm transition-all duration-200 active:scale-[0.98] active:pl-5",
        active
          ? "border-foreground font-medium"
          : "border-transparent text-muted hover:border-line-strong hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}