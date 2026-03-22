import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-3xl border border-[var(--color-line)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus-visible:border-[var(--color-accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-3xl border border-[var(--color-line)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus-visible:border-[var(--color-accent)]",
        className,
      )}
      {...props}
    />
  );
});
