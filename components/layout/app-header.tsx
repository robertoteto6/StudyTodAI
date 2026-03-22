"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { type AppDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/types";

export function AppHeader({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: AppDictionary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const isLandingRoute = pathname === `/${locale}`;

  async function handleSignOut() {
    setBusy(true);

    try {
      await signOut();
      router.push(`/${locale}/login`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const registerLinkClass =
    "inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)]";

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
      <Link href={`/${locale}`} className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-ink)] text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl leading-none">StudyTodAI</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{dictionary.nav.tagline}</p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <nav className="hidden items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/65 px-2 py-1 sm:flex">
          {isLandingRoute ? (
            <>
              <Link href={`/${locale}/login`} className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white">
                {dictionary.nav.login}
              </Link>
              <Link className={registerLinkClass} href={`/${locale}/login?mode=signup`}>
                {dictionary.nav.register}
              </Link>
            </>
          ) : user ? (
            <>
              <Link href={`/${locale}/projects`} className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white">
                {dictionary.nav.dashboard}
              </Link>
              <span className="px-3 py-2 text-sm text-[var(--color-ink-soft)]">
                {user.name}
              </span>
              <Button
                className="px-3 py-2"
                variant="ghost"
                disabled={busy}
                onClick={handleSignOut}
              >
                {dictionary.nav.logout}
              </Button>
            </>
          ) : (
            <Link href={`/${locale}/login`} className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white">
              {dictionary.nav.login}
            </Link>
          )}
        </nav>
        {isLandingRoute ? (
          <Link
            href={`/${locale}/login`}
            className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white sm:hidden"
          >
            {dictionary.nav.login}
          </Link>
        ) : user ? (
          <Button
            className="sm:hidden"
            variant="ghost"
            disabled={busy}
            onClick={handleSignOut}
          >
            {dictionary.nav.logout}
          </Button>
        ) : (
          <Link
            href={`/${locale}/login`}
            className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white sm:hidden"
          >
            {dictionary.nav.login}
          </Link>
        )}
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  );
}
