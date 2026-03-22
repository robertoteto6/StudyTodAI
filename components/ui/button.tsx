"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--color-ink)] text-white hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)]",
        variant === "secondary" &&
          "border border-[var(--color-line)] bg-white/75 text-[var(--color-ink)] hover:-translate-y-0.5",
        variant === "ghost" &&
          "bg-transparent text-[var(--color-ink-soft)] hover:bg-white/55 hover:text-[var(--color-ink)]",
        className,
      )}
      {...props}
    />
  );
});
