"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { type Locale } from "@/lib/types";

function LocaleSwitcherLinks({
  locale,
  pathname,
  search,
}: {
  locale: Locale;
  pathname: string;
  search: string;
}) {
  const normalizedPathname = pathname.replace(/^\/(es|en)/, `/${locale}`);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-1 py-1 shadow-sm">
      <span className="hidden rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] sm:inline-flex">
        Lang
      </span>
      {(["es", "en"] as const).map((value) => {
        const nextPath = normalizedPathname.replace(/^\/(es|en)/, `/${value}`);
        const href = search ? `${nextPath}?${search}` : nextPath;
        const active = value === locale;

        return (
          <Link
            key={value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`min-w-11 rounded-full px-3 py-1.5 text-center text-xs font-semibold tracking-[0.18em] transition-colors ${
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

function LocaleSwitcherContent({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const searchParams = useSearchParams();

  return (
    <LocaleSwitcherLinks locale={locale} pathname={pathname} search={searchParams.toString()} />
  );
}

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <Suspense fallback={<LocaleSwitcherLinks locale={locale} pathname={pathname} search="" />}>
      <LocaleSwitcherContent locale={locale} pathname={pathname} />
    </Suspense>
  );
}
