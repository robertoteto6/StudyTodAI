"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from "react";
import { FolderOpen, MessageSquareText, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { PROJECT_ACCENT_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { type Locale, type Project } from "@/lib/types";

type DashboardDictionary = {
  eyebrow: string;
  title: string;
  description: string;
  createTitle: string;
  name: string;
  descriptionField: string;
  subject: string;
  accentColor: string;
  createCta: string;
  emptyTitle: string;
  emptyDescription: string;
  openProject: string;
  documents: string;
  chatReady: string;
};

export function DashboardShell({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: DashboardDictionary;
}) {
  const router = useRouter();
  const { user, loading, getAuthorizationHeader } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [accentColor, setAccentColor] = useState(PROJECT_ACCENT_COLORS[0]);
  const deferredSearch = useDeferredValue(search);

  const loadProjects = useEffectEvent(async () => {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    const response = await fetch("/api/projects", {
      headers: { authorization: authHeader },
    });
    const data = (await response.json()) as { projects: Project[]; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load projects");
    }

    startTransition(() => setProjects(data.projects));
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    void loadProjects().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Unable to load projects");
    });
  }, [loading, user, locale, router]);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          subject,
          accentColor,
        }),
      });
      const data = (await response.json()) as { project?: Project; error?: string };

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "Unable to create project");
      }

      setProjects((current) => [data.project!, ...current]);
      setName("");
      setDescription("");
      setSubject("");
      router.push(`/${locale}/projects/${data.project.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create project");
    } finally {
      setBusy(false);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const value = deferredSearch.toLowerCase();
    return (
      project.name.toLowerCase().includes(value) ||
      project.subject.toLowerCase().includes(value) ||
      project.description.toLowerCase().includes(value)
    );
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 sm:px-6">
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="glass-panel rounded-[2.5rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-ink-soft)]">
            {dictionary.eyebrow}
          </p>
          <h1 className="display-text mt-4 text-4xl sm:text-5xl">{dictionary.title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {dictionary.description}
          </p>

          <form className="mt-8 space-y-3" onSubmit={handleCreateProject}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{dictionary.createTitle}</p>
              <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
                {user?.provider === "firebase" ? "Firebase" : "Demo"}
              </span>
            </div>
            <Input
              placeholder={dictionary.name}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              placeholder={dictionary.subject}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <Textarea
              rows={4}
              placeholder={dictionary.descriptionField}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {PROJECT_ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  className={`h-10 w-10 rounded-full border-2 ${
                    accentColor === color ? "border-[var(--color-ink)]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button className="w-full" disabled={busy || loading || !user}>
              <Plus className="mr-2 h-4 w-4" />
              {dictionary.createCta}
            </Button>
          </form>
        </div>

        <div className="glass-panel rounded-[2.5rem] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{projects.length} projects</p>
              <p className="text-sm text-[var(--color-ink-soft)]">Search by class, topic, or exam scope.</p>
            </div>
            <div className="w-full max-w-xs">
              <Input placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredProjects.length ? (
              filteredProjects.map((project) => (
                <Link
                  href={`/${locale}/projects/${project.id}`}
                  key={project.id}
                  className="group rounded-[2rem] border border-[var(--color-line)] bg-white/72 p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-soft)]">
                        {project.subject || "General"}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold">{project.name}</h2>
                    </div>
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: project.accentColor }}
                    />
                  </div>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {project.description || "No description provided yet."}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                    <span>{formatDate(project.updatedAt, locale)}</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquareText className="h-4 w-4" />
                      {dictionary.chatReady}
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-strong)]">
                    <FolderOpen className="h-4 w-4" />
                    {dictionary.openProject}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[var(--color-line)] p-8 md:col-span-2">
                <p className="display-text text-3xl">{dictionary.emptyTitle}</p>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-ink-soft)]">
                  {dictionary.emptyDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
