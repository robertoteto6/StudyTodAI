"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/lib/types";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex rounded-full border border-[var(--color-line)] bg-white/70 p-1">
      {(["es", "en"] as const).map((value) => {
        const nextPath = pathname.replace(/^\/(es|en)/, `/${value}`);
        const active = value === locale;

        return (
          <Link
            key={value}
            href={nextPath}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
            }`}
          >
            {value.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
