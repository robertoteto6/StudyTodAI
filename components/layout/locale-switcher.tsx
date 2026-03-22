"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/lib/types";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-1 shadow-sm">
      {(["es", "en"] as const).map((value) => {
        const nextPath = pathname.replace(/^\/(es|en)/, `/${value}`);
        const active = value === locale;

        return (
          <Link
            key={value}
            href={nextPath}
            aria-current={active ? "page" : undefined}
            className={`min-w-11 rounded-full px-3 py-1.5 text-center text-xs font-semibold tracking-[0.16em] transition-colors ${
              active
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--color-ink-soft)] hover:bg-white hover:text-[var(--color-ink)]"
            }`}
          >
            {value.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
