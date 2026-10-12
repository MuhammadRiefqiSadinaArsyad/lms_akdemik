import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn, initials } from "@/lib/utils";
import type { AssignmentStatus } from "@/lib/types";

export function Btn({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "sm";
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors duration-200",
    size === "md" ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs",
    variant === "primary" && "bg-foreground text-background hover:bg-black/80",
    variant === "outline" && "border border-line-strong text-foreground hover:border-foreground",
    variant === "ghost" && "text-foreground hover:text-black/60",
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export const inputCls =
  "w-full border-b border-line-strong bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none transition-colors";

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full border-b border-line-strong bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none transition-colors",
        className,
      )}
      {...rest}
    />
  );
}

export function Checkbox({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input type="checkbox" className="h-4 w-4 accent-[#1b1915]" {...rest} />
      {label}
    </label>
  );
}

const statusColors: Record<AssignmentStatus | "graded", string> = {
  draft: "text-muted border-line",
  scheduled: "text-foreground border-line-strong",
  active: "text-foreground border-foreground",
  paused: "text-muted border-line-strong",
  closed: "text-muted border-line",
  graded: "text-foreground border-foreground",
};

export function StatusBadge({
  status,
  label,
}: {
  status: AssignmentStatus | "graded";
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]",
        statusColors[status],
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          status === "active" ? "bg-foreground" : "bg-muted/50",
        )}
      />
      {label}
    </span>
  );
}

export function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-[0_8px_24px_rgba(27,25,21,0.06)]">
      <p className="font-serif text-4xl leading-none">{value}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-panel text-xs font-medium",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function SectionHeading({
  index,
  title,
  sub,
  action,
}: {
  index?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted">
          {index ? `${index} — ` : ""}
          {sub ?? "Section"}
        </p>
        <h2 className="font-serif text-3xl leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-panel px-8 py-16 text-center shadow-[0_8px_24px_rgba(27,25,21,0.04)]">
      <p className="font-serif text-xl">{title}</p>
      {desc ? <p className="mt-2 text-sm text-muted">{desc}</p> : null}
    </div>
  );
}

export function Table({
  heads,
  children,
}: {
  heads: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_8px_24px_rgba(27,25,21,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-background/60">
              {heads.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="py-3 pl-6 pr-6 text-[10px] font-medium uppercase tracking-[0.2em] text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Td({ className, children }: { className?: string; children: ReactNode }) {
  return <td className={cn("py-4 pl-6 pr-6 align-middle text-sm", className)}>{children}</td>;
}