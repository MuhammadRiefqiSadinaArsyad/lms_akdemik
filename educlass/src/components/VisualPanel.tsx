import { cn } from "@/lib/utils";

export function VisualPanel({ banner = false }: { banner?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#161410] text-[#f3f0e6]",
        banner ? "h-48 lg:hidden" : "hidden lg:flex",
      )}
    >
      {/* texture grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(#f3f0e6 1px, transparent 1px), linear-gradient(90deg, #f3f0e6 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* soft corner glow */}
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#f3f0e6]/[0.06] blur-3xl"
      />

      <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#f3f0e6]/70">
          <span className="font-serif text-base normal-case tracking-normal text-[#f3f0e6]">
            EduClass
          </span>
          <nav className="hidden gap-6 sm:flex">
            <a href="#" className="hover:text-[#f3f0e6] transition-colors">Beranda</a>
            <a href="#" className="hover:text-[#f3f0e6] transition-colors">Bantuan</a>
            <span className="flex items-center gap-1">Bahasa <span aria-hidden>⌄</span></span>
          </nav>
        </div>

        {banner ? (
          <p className="font-serif text-2xl leading-tight sm:text-3xl">
            Learn. Practice. Submit.
          </p>
        ) : (
          <div className="space-y-10">
            <p className="font-serif text-lg italic text-[#f3f0e6]/80">Better Learning, Brighter Future</p>
            <div className="space-y-1">
              <p className="font-serif text-5xl leading-[1.05] xl:text-6xl">Learn.</p>
              <p className="font-serif text-5xl leading-[1.05] xl:text-6xl">Practice.</p>
              <p className="font-serif text-5xl leading-[1.05] xl:text-6xl">Submit.</p>
            </div>
            <div className="max-w-sm space-y-3 text-sm leading-relaxed text-[#f3f0e6]/70">
              <p>
                Semua materi dan tugas perkuliahan dalam satu tempat.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[11px] uppercase tracking-[0.2em] text-[#f3f0e6]/50">
                <span>01 Materi</span>
                <span>02 Tugas</span>
                <span className="h-px w-8 bg-[#f3f0e6]/30" aria-hidden />
                <span>03 Nilai</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
