"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { user, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

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
          <Link href={`/${locale}/projects`} className="rounded-full px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-white">
            {dictionary.nav.dashboard}
          </Link>
          {user ? (
            <>
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
        {user ? (
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
