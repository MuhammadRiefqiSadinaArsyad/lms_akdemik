import type { Assignment, AssignmentStatus } from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 15) return "Good afternoon";
  if (h < 19) return "Good evening";
  return "Good night";
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** status efektif: manual (draft/paused) menang, selain itu mengikuti waktu */
export function effectiveStatus(
  a: Assignment,
  now: Date = new Date(),
): AssignmentStatus {
  if (a.status === "draft" || a.status === "paused") return a.status;
  if (now < new Date(a.start_time)) return "scheduled";
  if (now <= new Date(a.deadline)) return "active";
  return "closed";
}

export function statusLabel(s: AssignmentStatus): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "scheduled":
      return "Terjadwal";
    case "active":
      return "Aktif";
    case "paused":
      return "Ditunda";
    case "closed":
      return "Ditutup";
  }
}

export function countdown(deadlineIso: string): string {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  if (diff <= 0) return "Waktu habis";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}j ${m}m tersisa`;
  return `${m}m tersisa`;
}

export function initials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.|Ir\.|Hj\.|H\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}