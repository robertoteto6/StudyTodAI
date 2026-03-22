"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Clock3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Locale, type ProjectListItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type ProjectSwitcherDictionary = {
  switchProject: string;
  favorites: string;
  recent: string;
  noProjects: string;
  noSubject: string;
};

export function ProjectSwitcher({
  locale,
  currentProjectId,
  projects,
  dictionary,
}: {
  locale: Locale;
  currentProjectId: string;
  projects: ProjectListItem[];
  dictionary: ProjectSwitcherDictionary;
}) {
  const [open, setOpen] = useState(false);
  const favorites = projects.filter((item) => item.project.isFavorite).slice(0, 4);
  const recents = projects
    .filter((item) => item.project.id !== currentProjectId)
    .slice(0, 6);

  return (
    <div className="relative">
      <Button type="button" variant="secondary" onClick={() => setOpen((current) => !current)}>
        {dictionary.switchProject}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[22rem] rounded-[1.8rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-panel)] backdrop-blur-xl">
          <div className="space-y-5">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
                <Star className="h-3.5 w-3.5" />
                {dictionary.favorites}
              </div>
              {favorites.length ? (
                favorites.map(({ project }) => (
                  <Link
                    key={project.id}
                    href={`/${locale}/projects/${project.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-[1.2rem] border px-4 py-3 transition hover:bg-white",
                      project.id === currentProjectId
                        ? "border-[var(--color-accent)] bg-white"
                        : "border-[var(--color-line)] bg-white/70",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{project.name}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">
                          {project.subject || dictionary.noSubject}
                        </p>
                      </div>
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: project.accentColor }}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[1.2rem] border border-dashed border-[var(--color-line)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
                  {dictionary.noProjects}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
                <Clock3 className="h-3.5 w-3.5" />
                {dictionary.recent}
              </div>
              {recents.length ? (
                recents.map(({ project }) => (
                  <Link
                    key={project.id}
                    href={`/${locale}/projects/${project.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-[1.2rem] border border-[var(--color-line)] bg-white/70 px-4 py-3 transition hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{project.name}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">
                          {formatDate(project.updatedAt, locale)}
                        </p>
                      </div>
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: project.accentColor }}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-[1.2rem] border border-dashed border-[var(--color-line)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
                  {dictionary.noProjects}
                </p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
