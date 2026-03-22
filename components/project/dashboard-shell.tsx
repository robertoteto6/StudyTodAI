"use client";

import { useRouter } from "next/navigation";
import {
  Archive,
  FolderOpen,
  PencilLine,
  Plus,
  Search,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProjectForm, type ProjectFormValues } from "@/components/project/project-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localizeErrorMessage } from "@/lib/i18n/error-messages";
import { type AppDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, type Project, type ProjectListItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const EMPTY_FORM: ProjectFormValues = {
  name: "",
  description: "",
  subject: "",
  accentColor: "#0f766e",
};

type SortMode = "updated" | "name" | "subject";
type VisibilityMode = "all" | "favorites";

export function DashboardShell({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: AppDictionary;
}) {
  const router = useRouter();
  const { user, loading, getAuthorizationHeader } = useAuth();
  const copy = dictionary.dashboard;
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProjectFormValues>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const loadProjects = useEffectEvent(async () => {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setLoadingProjects(true);
    const response = await fetch("/api/projects?status=all", {
      headers: { authorization: authHeader },
    });
    const data = (await response.json()) as { projects: ProjectListItem[]; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? dictionary.errors.unableToLoadProjects);
    }

    startTransition(() => {
      setProjects(data.projects);
      setLoadingProjects(false);
    });
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
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToLoadProjects,
          dictionary.errors,
        ),
      );
      setLoadingProjects(false);
    });
  }, [dictionary.errors, loading, user, locale, router]);

  function resetForm() {
    setFormMode("create");
    setEditingProjectId(null);
    setFormValues(EMPTY_FORM);
  }

  function startEditing(project: Project) {
    setFormMode("edit");
    setEditingProjectId(project.id);
    setFormValues({
      name: project.name,
      description: project.description,
      subject: project.subject,
      accentColor: project.accentColor,
    });
    setShowMobileEditor(true);
  }

  function updateLocalProject(project: Project) {
    setProjects((current) =>
      current.map((item) =>
        item.project.id === project.id
          ? {
              ...item,
              project,
            }
          : item,
      ),
    );
  }

  function addLocalProject(project: Project) {
    setProjects((current) => [
      {
        project,
        documentCount: 0,
        readyDocumentCount: 0,
        processingDocumentCount: 0,
      },
      ...current,
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formMode === "edit" && !editingProjectId) {
      return;
    }

    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = formMode === "create" ? "/api/projects" : `/api/projects/${editingProjectId}`;
      const method = formMode === "create" ? "POST" : "PATCH";
      const response = await fetch(endpoint, {
        method,
        headers: {
          authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });
      const data = (await response.json()) as { project?: Project; error?: string };

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? dictionary.errors.unableToSaveProject);
      }

      if (formMode === "create") {
        addLocalProject(data.project);
      } else {
        updateLocalProject(data.project);
      }

      resetForm();
      setShowMobileEditor(false);
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToSaveProject,
          dictionary.errors,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProjectMutation(
    projectId: string,
    payload: Record<string, boolean>,
    onSuccess: (project: Project) => void,
  ) {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setBusyProjectId(projectId);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { project?: Project; error?: string };

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? dictionary.errors.unableToUpdateProject);
      }

      onSuccess(data.project);
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToUpdateProject,
          dictionary.errors,
        ),
      );
    } finally {
      setBusyProjectId(null);
    }
  }

  async function handleDelete(projectId: string) {
    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }

    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setBusyProjectId(projectId);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { authorization: authHeader },
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? dictionary.errors.unableToDeleteProject);
      }

      setProjects((current) => current.filter((item) => item.project.id !== projectId));
      if (editingProjectId === projectId) {
        resetForm();
      }
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToDeleteProject,
          dictionary.errors,
        ),
      );
    } finally {
      setBusyProjectId(null);
    }
  }

  const value = deferredSearch.toLowerCase().trim();
  const activeProjects = projects.filter((item) => !item.project.archivedAt);
  const matchedProjects = value
    ? activeProjects.filter((item) => {
        const haystack = [
          item.project.name,
          item.project.subject,
          item.project.description,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(value);
      })
    : activeProjects;

  const visibleProjects =
    visibilityMode === "favorites"
      ? matchedProjects.filter((item) => item.project.isFavorite)
      : matchedProjects;

  const filteredProjects = [...visibleProjects].sort((left, right) => {
    if (sortMode === "name") {
      return left.project.name.localeCompare(right.project.name);
    }
    if (sortMode === "subject") {
      return (left.project.subject || copy.noSubject).localeCompare(
        right.project.subject || copy.noSubject,
      );
    }
    return right.project.updatedAt.localeCompare(left.project.updatedAt);
  });

  const favoriteProjects = filteredProjects.filter((item) => item.project.isFavorite);
  const recentProjects = [...filteredProjects]
    .sort((left, right) => right.project.updatedAt.localeCompare(left.project.updatedAt))
    .slice(0, 6);
  const archivedProjects = projects.filter((item) => Boolean(item.project.archivedAt));

  function renderProjectCard(item: ProjectListItem, archived = false) {
    const { project } = item;
    const isBusy = busyProjectId === project.id;

    return (
      <article
        key={project.id}
        className="rounded-[1.75rem] border border-[var(--color-line)] bg-white/80 p-5 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: project.accentColor }}
              />
              <p className="truncate text-lg font-semibold">{project.name}</p>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
              {project.subject || copy.noSubject}
            </p>
          </div>
          {project.isFavorite && !archived ? (
            <span className="inline-flex rounded-full bg-[var(--color-accent-soft)] p-2 text-[var(--color-accent-strong)]">
              <Star className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>

        <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--color-ink-soft)]">
          {project.description || copy.noDescription}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="project-metric-card">
            <span className="project-metric-value">{item.documentCount}</span>
            <span className="project-metric-label">{copy.documentsTotal}</span>
          </div>
          <div className="project-metric-card">
            <span className="project-metric-value">{item.readyDocumentCount}</span>
            <span className="project-metric-label">{copy.documentsReady}</span>
          </div>
          <div className="project-metric-card">
            <span className="project-metric-value">{item.processingDocumentCount}</span>
            <span className="project-metric-label">{copy.documentsProcessing}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--color-ink-soft)]">
          {copy.lastActivity}: {formatDate(project.updatedAt, locale)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {!archived ? (
            <Button type="button" onClick={() => router.push(`/${locale}/projects/${project.id}`)}>
              <FolderOpen className="mr-2 h-4 w-4" />
              {copy.openProject}
            </Button>
          ) : null}
          {!archived ? (
            <Button type="button" variant="secondary" onClick={() => startEditing(project)}>
              <PencilLine className="mr-2 h-4 w-4" />
              {copy.editProject}
            </Button>
          ) : null}
          {!archived ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() =>
                void handleProjectMutation(
                  project.id,
                  { isFavorite: !project.isFavorite },
                  updateLocalProject,
                )
              }
            >
              <Star className="mr-2 h-4 w-4" />
              {project.isFavorite ? copy.unfavorite : copy.favorite}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() =>
              void handleProjectMutation(
                project.id,
                { archived: !archived },
                updateLocalProject,
              )
            }
          >
            {archived ? <Undo2 className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {archived ? copy.restore : copy.archive}
          </Button>
          {archived ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() => void handleDelete(project.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {copy.delete}
            </Button>
          ) : null}
        </div>
      </article>
    );
  }

  function renderSection(title: string, items: ProjectListItem[]) {
    if (!items.length) {
      return null;
    }

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[var(--color-ink-soft)]">
            {items.length}
          </span>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => renderProjectCard(item))}</div>
      </section>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 sm:px-6">
      <section className="project-dashboard-grid">
        <div className="space-y-6">
          <div className="glass-panel rounded-[2.4rem] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-ink-soft)]">
                  {copy.eyebrow}
                </p>
                <h1 className="display-text mt-4 text-4xl sm:text-5xl">{copy.title}</h1>
                <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                  {copy.description}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white sm:hidden"
                onClick={() => {
                  if (showMobileEditor) {
                    setShowMobileEditor(false);
                    return;
                  }

                  resetForm();
                  setShowMobileEditor(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {copy.createCta}
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="project-summary-card">
                <span className="project-summary-value">
                  {projects.filter((item) => !item.project.archivedAt).length}
                </span>
                <span className="project-summary-label">{copy.activeProjects}</span>
              </div>
              <div className="project-summary-card">
                <span className="project-summary-value">
                  {projects.filter((item) => item.project.isFavorite && !item.project.archivedAt).length}
                </span>
                <span className="project-summary-label">{copy.favoritesCounter}</span>
              </div>
              <div className="project-summary-card">
                <span className="project-summary-value">{archivedProjects.length}</span>
                <span className="project-summary-label">{copy.archivedCounter}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2.2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 items-center gap-3 rounded-[1.4rem] border border-[var(--color-line)] bg-white/75 px-4 py-3">
                <Search className="h-4 w-4 text-[var(--color-ink-soft)]" />
                <Input
                  className="border-0 bg-transparent p-0"
                  placeholder={copy.searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-full border border-[var(--color-line)] bg-white/75 p-1">
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium",
                      visibilityMode === "all"
                        ? "bg-[var(--color-ink)] text-white"
                        : "text-[var(--color-ink-soft)]",
                    )}
                    onClick={() => setVisibilityMode("all")}
                  >
                    {copy.allFilter}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium",
                      visibilityMode === "favorites"
                        ? "bg-[var(--color-ink)] text-white"
                        : "text-[var(--color-ink-soft)]",
                    )}
                    onClick={() => setVisibilityMode("favorites")}
                  >
                    {copy.favoriteFilter}
                  </button>
                </div>

                <label className="inline-flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-white/75 px-4 py-2.5 text-sm text-[var(--color-ink-soft)]">
                  <span>{copy.sortLabel}</span>
                  <select
                    className="bg-transparent text-sm text-[var(--color-ink)] outline-none"
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                  >
                    <option value="updated">{copy.sortUpdated}</option>
                    <option value="name">{copy.sortName}</option>
                    <option value="subject">{copy.sortSubject}</option>
                  </select>
                </label>

                <Button type="button" variant="secondary" onClick={() => setShowArchived((current) => !current)}>
                  <Archive className="mr-2 h-4 w-4" />
                  {showArchived ? copy.archivedClose : copy.archivedToggle}
                </Button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loadingProjects ? (
            <div className="glass-panel rounded-[2rem] p-8 text-sm text-[var(--color-ink-soft)]">
              {copy.loadingProjects}
            </div>
          ) : filteredProjects.length ? (
            <div className="space-y-8">
              {renderSection(copy.favoritesSection, favoriteProjects)}
              {renderSection(copy.recentSection, recentProjects)}
              {renderSection(copy.allSection, filteredProjects)}
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] p-8">
              <p className="display-text text-3xl">{copy.emptyTitle}</p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-ink-soft)]">
                {copy.emptyDescription}
              </p>
            </div>
          )}

          {showArchived ? (
            <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{copy.archivedSection}</h2>
                <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[var(--color-ink-soft)]">
                  {archivedProjects.length}
                </span>
              </div>
              {archivedProjects.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {archivedProjects.map((item) => renderProjectCard(item, true))}
                </div>
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-ink-soft)]">
                  {copy.emptyArchived}
                </p>
              )}
            </section>
          ) : null}
        </div>

        <aside className={cn("project-editor-panel", showMobileEditor ? "block" : "hidden lg:block")}>
          <div className="glass-panel rounded-[2.2rem] p-5 sm:p-6 lg:sticky lg:top-6">
            <ProjectForm
              mode={formMode}
              values={formValues}
              busy={submitting}
              showCancel={formMode === "edit" || showMobileEditor}
              dictionary={copy}
              onChange={(field, value) =>
                setFormValues((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
              onSubmit={handleSubmit}
              onCancel={() => {
                resetForm();
                setShowMobileEditor(false);
              }}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
