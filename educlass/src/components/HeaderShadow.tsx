"use client";

import { useEffect, useRef } from "react";

/** Menambah class `is-scrolled` pada <header> terdekat saat halaman di-scroll. */
export function HeaderShadow() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = ref.current?.closest("header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <span ref={ref} aria-hidden className="hidden" />;
}
