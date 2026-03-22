"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, BrainCircuit, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { type AppDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/types";

type LandingShellProps = {
  locale: Locale;
  dictionary: AppDictionary;
};

export function LandingShell({ locale, dictionary }: LandingShellProps) {
  const { user } = useAuth();
  const primaryHref = user ? `/${locale}/projects` : `/${locale}/login`;
  const copy = dictionary.landing;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6">
      <section className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-teal-200/40 via-white/0 to-orange-200/30" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-ink-soft)]">
              {copy.eyebrow}
            </p>
            <h1 className="display-text mt-6 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-ink-soft)] sm:text-lg">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primaryHref}>
                <Button>
                  {copy.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/login`}>
                <Button variant="secondary">{copy.secondaryCta}</Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {copy.bullets.map((bullet, index) => {
                const Icon = [BrainCircuit, FileStack, BookOpenText][index] ?? BrainCircuit;
                return (
                  <div
                    key={bullet}
                    className="rounded-[1.75rem] border border-[var(--color-line)] bg-white/70 p-4"
                  >
                    <Icon className="h-5 w-5 text-[var(--color-accent-strong)]" />
                    <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{bullet}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="grid gap-6">
          <div className="glass-panel rounded-[2.25rem] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-ink-soft)]">
              {copy.studioTitle}
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.75rem] border border-[var(--color-line)] bg-[#11212b] p-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  {copy.studioChatTitle}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/80">{copy.studioChatDescription}</p>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--color-line)] bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-ink-soft)]">
                  {copy.studioProcessingTitle}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {copy.studioProcessingDescription}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-[2.25rem] p-6">
            <p className="display-text text-2xl">{copy.workspaceTitle}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{copy.workspaceDescription}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
