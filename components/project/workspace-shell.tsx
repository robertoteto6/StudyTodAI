"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowLeft, FileUp, PencilLine, SendHorizontal } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProjectForm, type ProjectFormValues } from "@/components/project/project-form";
import { ProjectSwitcher } from "@/components/project/project-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { localizeErrorMessage } from "@/lib/i18n/error-messages";
import { type AppDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatFileSize } from "@/lib/utils";
import { type ChatMessage, type DocumentRecord, type Locale, type Project, type ProjectListItem } from "@/lib/types";

type ProjectPayload = {
  project: Project;
  documents: DocumentRecord[];
  activeChat: { id: string };
};

type UploadFailure = {
  fileName: string;
  error: string;
};

const EMPTY_PROJECT_FORM: ProjectFormValues = {
  name: "",
  description: "",
  subject: "",
  accentColor: "#0f766e",
};

function documentStatusLabel(status: DocumentRecord["status"], dictionary: AppDictionary["workspace"]) {
  switch (status) {
    case "queued":
      return dictionary.queued;
    case "processing":
      return dictionary.processing;
    case "ready":
      return dictionary.ready;
    case "error":
      return dictionary.error;
  }
}

export function WorkspaceShell({
  locale,
  projectId,
  dictionary,
}: {
  locale: Locale;
  projectId: string;
  dictionary: AppDictionary;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading, getAuthorizationHeader } = useAuth();
  const copy = dictionary.workspace;
  const [project, setProject] = useState<Project | null>(null);
  const [projectsIndex, setProjectsIndex] = useState<ProjectListItem[]>([]);
  const [projectFormValues, setProjectFormValues] = useState<ProjectFormValues>(EMPTY_PROJECT_FORM);
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [mobileTab, setMobileTab] = useState<"docs" | "preview" | "chat">("docs");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(documentsSearch);
  const activeDocument = documents.find((document) => document.id === selectedDocumentId) ?? null;

  async function refreshProjectsIndex() {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    const response = await fetch("/api/projects?status=active", {
      headers: { authorization: authHeader },
    });
    const payload = (await response.json()) as { projects: ProjectListItem[]; error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? dictionary.errors.unableToLoadProjects);
    }

    startTransition(() => setProjectsIndex(payload.projects));
  }

  const loadProjectsIndex = useEffectEvent(async () => {
    await refreshProjectsIndex();
  });

  const loadProject = useEffectEvent(async () => {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    const response = await fetch(`/api/projects/${projectId}`, {
      headers: { authorization: authHeader },
    });
    const payload = (await response.json()) as ProjectPayload & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? dictionary.errors.unableToLoadProject);
    }

    startTransition(() => {
      setProject(payload.project);
      setProjectFormValues({
        name: payload.project.name,
        description: payload.project.description,
        subject: payload.project.subject,
        accentColor: payload.project.accentColor,
      });
      setDocuments(payload.documents);
      setActiveChatId(payload.activeChat.id);
      setSelectedDocumentId((current) =>
        payload.documents.some((document) => document.id === current)
          ? current
          : payload.documents[0]?.id ?? null,
      );
      setLoadingProject(false);
    });
  });

  const loadMessages = useEffectEvent(async (chatId: string) => {
    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/chats/${chatId}/messages`, {
      headers: { authorization: authHeader },
    });
    const payload = (await response.json()) as { messages: ChatMessage[]; error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? dictionary.errors.unableToLoadMessages);
    }

    startTransition(() => setMessages(payload.messages));
  });

  useEffect(() => {
    setLoadingProject(true);
    setSelectedFilters([]);
    setSelectedDocumentId(null);
    setMessages([]);
    setActiveChatId(null);
    setShowProjectEditor(false);
  }, [projectId]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    void Promise.all([loadProject(), loadProjectsIndex()]).catch((nextError) => {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToLoadProject,
          dictionary.errors,
        ),
      );
      setLoadingProject(false);
    });
  }, [dictionary.errors, loading, user, locale, projectId, router]);

  useEffect(() => {
    if (!activeChatId || !user) {
      return;
    }

    void loadMessages(activeChatId).catch((nextError) => {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToLoadMessages,
          dictionary.errors,
        ),
      );
    });
  }, [activeChatId, dictionary.errors, projectId, user]);

  useEffect(() => {
    if (!documents.some((document) => document.status === "queued" || document.status === "processing")) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadProject().catch((nextError) => {
        setError(
          localizeErrorMessage(
            nextError instanceof Error ? nextError.message : dictionary.errors.unableToRefreshProject,
            dictionary.errors,
          ),
        );
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [dictionary.errors, documents]);

  useEffect(() => {
    let revokedUrl: string | null = null;

    async function loadPreviewAsset() {
      if (!activeDocument || activeDocument.status !== "ready") {
        setPreviewUrl(null);
        return;
      }

      const authHeader = await getAuthorizationHeader();
      if (!authHeader) {
        setPreviewUrl(null);
        return;
      }

      const response = await fetch(`/api/projects/${projectId}/documents/${activeDocument.id}/asset`, {
        headers: { authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error(dictionary.errors.unableToLoadPreview);
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      revokedUrl = nextUrl;
      setPreviewUrl(nextUrl);
    }

    void loadPreviewAsset().catch((nextError) => {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToLoadPreview,
          dictionary.errors,
        ),
      );
    });

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [activeDocument, dictionary.errors, getAuthorizationHeader, projectId]);

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(deferredSearch.toLowerCase()),
  );

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const response = await fetch(`/api/projects/${projectId}/documents/upload`, {
        method: "POST",
        headers: { authorization: authHeader },
        body: formData,
      });
      const payload = (await response.json()) as {
        documents?: DocumentRecord[];
        failures?: UploadFailure[];
        error?: string;
      };

      if (!response.ok || !payload.documents) {
        throw new Error(payload.error ?? dictionary.errors.unableToUploadDocuments);
      }

      setDocuments((current) => [...payload.documents!, ...current]);
      setSelectedDocumentId((current) => current ?? payload.documents?.[0]?.id ?? null);
      if (payload.failures?.length) {
        setError(
          payload.failures
            .map(
              (failure) =>
                `${failure.fileName}: ${localizeErrorMessage(failure.error, dictionary.errors)}`,
            )
            .join(" | "),
        );
      }
      void refreshProjectsIndex().catch(() => undefined);
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToUploadDocuments,
          dictionary.errors,
        ),
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: {
          authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          selectedDocumentIds: selectedFilters,
          locale,
        }),
      });
      const payload = (await response.json()) as {
        assistantMessage?: ChatMessage;
        userMessage?: ChatMessage;
        chat?: { id: string };
        error?: string;
      };

      if (!response.ok || !payload.userMessage || !payload.assistantMessage || !payload.chat) {
        throw new Error(payload.error ?? dictionary.errors.unableToSendMessage);
      }

      setActiveChatId(payload.chat.id);
      setMessages((current) => [...current, payload.userMessage!, payload.assistantMessage!]);
      setMessage("");
      setMobileTab("chat");
      void refreshProjectsIndex().catch(() => undefined);
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToSendMessage,
          dictionary.errors,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleProjectSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project) {
      return;
    }

    const authHeader = await getAuthorizationHeader();
    if (!authHeader) {
      return;
    }

    setSavingProject(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectFormValues),
      });
      const payload = (await response.json()) as { project?: Project; error?: string };

      if (!response.ok || !payload.project) {
        throw new Error(payload.error ?? dictionary.errors.unableToUpdateProject);
      }

      setProject(payload.project);
      setProjectsIndex((current) =>
        current.map((item) =>
          item.project.id === payload.project!.id
            ? {
                ...item,
                project: payload.project!,
              }
            : item,
        ),
      );
      setShowProjectEditor(false);
    } catch (nextError) {
      setError(
        localizeErrorMessage(
          nextError instanceof Error ? nextError.message : dictionary.errors.unableToUpdateProject,
          dictionary.errors,
        ),
      );
    } finally {
      setSavingProject(false);
    }
  }

  function toggleFilter(documentId: string) {
    setSelectedFilters((current) =>
      current.includes(documentId)
        ? current.filter((value) => value !== documentId)
        : [...current, documentId],
    );
  }

  function renderPreview() {
    if (!activeDocument) {
      return <p className="text-sm text-[var(--color-ink-soft)]">{copy.noPreview}</p>;
    }

    if (activeDocument.status !== "ready") {
      return (
        <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-[var(--color-line)] bg-white/45 p-6 text-center">
          <StatusChip
            status={activeDocument.status}
            label={documentStatusLabel(activeDocument.status, copy)}
          />
          <p className="max-w-md text-sm leading-6 text-[var(--color-ink-soft)]">
            {copy.unsupportedPreview}
          </p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex h-full min-h-80 items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-line)] bg-white/45 p-6 text-sm text-[var(--color-ink-soft)]">
          {copy.loadingPreview}
        </div>
      );
    }

    if (activeDocument.mimeType.startsWith("image/")) {
      return (
        <Image
          alt={activeDocument.name}
          src={previewUrl}
          width={1600}
          height={1200}
          unoptimized
          className="max-h-[72vh] w-full rounded-[2rem] object-contain"
        />
      );
    }

    if (activeDocument.mimeType !== "application/pdf") {
      return (
        <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-[var(--color-line)] bg-white/45 p-6 text-center">
          <StatusChip status="processing" label={copy.processing} />
          <p className="max-w-md text-sm leading-6 text-[var(--color-ink-soft)]">
            {copy.unsupportedPreview}
          </p>
        </div>
      );
    }

    return <iframe className="h-[72vh] w-full rounded-[2rem] border-0 bg-white" src={previewUrl} title={activeDocument.name} />;
  }

  const tabs = [
    { id: "docs", label: copy.mobileDocs },
    { id: "preview", label: copy.mobilePreview },
    { id: "chat", label: copy.mobileChat },
  ] as const;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 pb-8 pt-2 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <h1 className="mt-2 text-4xl">
            {loadingProject ? "..." : project?.name ?? copy.projectFallbackTitle}
          </h1>
          {project?.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
              {project.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {projectsIndex.length ? (
            <ProjectSwitcher
              locale={locale}
              currentProjectId={projectId}
              projects={projectsIndex}
              dictionary={{
                switchProject: copy.switchProject,
                favorites: copy.favorites,
                recent: copy.recent,
                noProjects: copy.noProjects,
                noSubject: copy.noSubject,
              }}
            />
          ) : null}
          <Button type="button" variant="secondary" onClick={() => setShowProjectEditor((current) => !current)}>
            <PencilLine className="mr-2 h-4 w-4" />
            {copy.editProject}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp"
            className="hidden"
            multiple
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={busy}>
            <FileUp className="mr-2 h-4 w-4" />
            {copy.upload}
          </Button>
        </div>
      </div>

      {showProjectEditor ? (
        <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <ProjectForm
            mode="edit"
            values={projectFormValues}
            busy={savingProject}
            showCancel
            dictionary={copy}
            onChange={(field, value) =>
              setProjectFormValues((current) => ({
                ...current,
                [field]: value,
              }))
            }
            onSubmit={handleProjectSave}
            onCancel={() => {
              setShowProjectEditor(false);
              setProjectFormValues(
                project
                  ? {
                      name: project.name,
                      description: project.description,
                      subject: project.subject,
                      accentColor: project.accentColor,
                    }
                  : EMPTY_PROJECT_FORM,
              );
            }}
          />
        </div>
      ) : null}

      <div className="glass-panel rounded-[2.5rem] p-3 sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full px-3 py-2 text-sm font-medium ${
                mobileTab === tab.id ? "bg-[var(--color-ink)] text-white" : "bg-white/60 text-[var(--color-ink-soft)]"
              }`}
              onClick={() => setMobileTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="workspace-grid">
        <aside className={`glass-panel rounded-[2rem] p-4 ${mobileTab !== "docs" ? "hidden sm:block" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{copy.documents}</h2>
            <Input
              className="max-w-40 py-2"
              placeholder={copy.documentsSearch}
              value={documentsSearch}
              onChange={(event) => setDocumentsSearch(event.target.value)}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{copy.processingHint}</p>
          <div className="mt-4 space-y-3">
            {filteredDocuments.length ? (
              filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className={`rounded-[1.5rem] border p-4 transition ${
                    selectedDocumentId === document.id
                      ? "border-[var(--color-accent)] bg-white"
                      : "border-[var(--color-line)] bg-white/65"
                  }`}
                >
                  <button
                    className="w-full text-left"
                    type="button"
                    onClick={() => {
                      setSelectedDocumentId(document.id);
                      setMobileTab("preview");
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-2 text-sm font-semibold">{document.name}</p>
                        <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                          {formatFileSize(document.sizeBytes)} · {formatDate(document.createdAt, locale)}
                        </p>
                      </div>
                      <StatusChip
                        status={document.status}
                        label={documentStatusLabel(document.status, copy)}
                      />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFilter(document.id)}
                    className={`mt-3 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedFilters.includes(document.id)
                        ? "bg-[var(--color-ink)] text-white"
                        : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                    }`}
                  >
                    {selectedFilters.includes(document.id)
                      ? copy.includedInChat
                      : copy.addToChatScope}
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
                {copy.noDocuments}
              </p>
            )}
          </div>
        </aside>

        <section className={`glass-panel rounded-[2rem] p-4 ${mobileTab !== "preview" ? "hidden sm:block" : ""}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{copy.preview}</h2>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {activeDocument?.name ?? copy.noPreview}
              </p>
            </div>
          </div>
          {renderPreview()}
        </section>

        <aside className={`glass-panel rounded-[2rem] p-4 ${mobileTab !== "chat" ? "hidden sm:block" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{copy.chat}</h2>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {selectedFilters.length
                  ? `${selectedFilters.length} ${copy.selectedDocs}`
                  : copy.filterAll}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--color-line)] bg-white/70 p-3">
            <p className="caps-label text-xs text-[var(--color-ink-soft)]">
              {copy.scopeLabel}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedFilters([])}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedFilters.length === 0
                    ? "bg-[var(--color-ink)] text-white"
                    : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                }`}
              >
                {copy.filterAll}
              </button>
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => toggleFilter(document.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedFilters.includes(document.id)
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-white text-[var(--color-ink-soft)]"
                  }`}
                >
                  {document.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex max-h-[52vh] min-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {messages.length ? (
              messages.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-[1.5rem] px-4 py-3 ${
                    entry.role === "assistant" ? "bg-white/75" : "bg-[var(--color-surface-dark)] text-white"
                  }`}
                >
                  <p className="caps-label text-xs opacity-60">
                    {entry.role === "assistant" ? copy.roleAssistant : copy.roleUser}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{entry.content}</p>
                  {entry.citations.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="caps-label text-xs font-semibold opacity-60">
                        {copy.citations}
                      </p>
                      {entry.citations.map((citation) => (
                        <button
                          key={`${entry.id}-${citation.documentId}-${citation.previewTarget}`}
                          type="button"
                          onClick={() => {
                            setSelectedDocumentId(citation.documentId);
                            setMobileTab("preview");
                          }}
                          className="w-full rounded-2xl border border-[var(--color-line)] bg-white/80 px-3 py-2 text-left text-xs text-[var(--color-ink)]"
                        >
                          <p className="font-semibold">
                            {citation.documentName} · {citation.pageOrSlide}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[var(--color-ink-soft)]">
                            {citation.snippet}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-6 text-center text-sm text-[var(--color-ink-soft)]">
                {copy.noMessages}
              </div>
            )}
          </div>

          <form className="mt-4 flex gap-2" onSubmit={handleSendMessage}>
            <Input
              placeholder={copy.askPlaceholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button aria-label={copy.send} disabled={busy || !message.trim()} type="submit">
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </aside>
      </section>
    </main>
  );
}
