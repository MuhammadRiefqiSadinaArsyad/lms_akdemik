import { VisualPanel } from "./VisualPanel";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* desktop: split 45/55 */}
      <div className="hidden min-h-screen lg:grid lg:grid-cols-[45fr_55fr]">
        <main className="flex flex-col justify-between px-12 py-10 xl:px-20">{children}</main>
        <VisualPanel />
      </div>
      {/* mobile: form dulu, visual jadi banner pendek */}
      <div className="lg:hidden">
        <main className="min-h-screen px-6 pb-4 pt-8">{children}</main>
        <VisualPanel banner />
      </div>
    </div>
  );
}

export function AuthBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-16"}>
      <p className="font-serif text-2xl">EduClass</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted">
        Learning &amp; Assessment Platform
      </p>
    </div>
  );
}