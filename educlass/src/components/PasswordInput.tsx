"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { inputCls } from "./ui";
import { IconEye, IconEyeOff } from "./NavIcons";

/** Input password editorial dengan tombol mata show/hide. */
export function PasswordInput({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const label = show ? "Sembunyikan password" : "Tampilkan password";

  return (
    <span className="group flex items-stretch">
      <input
        type={show ? "text" : "password"}
        className={cn(inputCls, "min-w-0 flex-1", className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={show}
        className="inline-flex w-11 shrink-0 items-center justify-center border-b border-line-strong text-muted transition-colors duration-200 hover:text-foreground group-focus-within:border-foreground group-focus-within:text-foreground active:scale-90"
      >
        {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </span>
  );
}
