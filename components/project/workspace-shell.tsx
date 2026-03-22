"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowLeft, FileUp, SendHorizontal } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { formatDate, formatFileSize } from "@/lib/utils";
import { type ChatMessage, type DocumentRecord, type Locale, type Project } from "@/lib/types";

type WorkspaceDictionary = {
  back: string;
  documents: string;
  preview: string;
  chat: string;
  upload: string;
  filterAll: string;
  askPlaceholder: string;
  send: string;
  processing: string;
  ready: string;
  queued: string;
  error: string;
  noDocuments: string;
  noPreview: string;
  noMessages: string;
  scopeLabel: string;
  citations: string;
  mobileDocs: string;
  mobilePreview: string;
  mobileChat: string;
  processingHint: string;
  unsupportedPreview: string;
};

type ProjectPayload = {
  project: Project;
  documents: DocumentRecord[];
  activeChat: { id: string };
};

type UploadFailure = {
  fileName: string;
  error: string;
};

function documentStatusLabel(status: DocumentRecord["status"], dictionary: WorkspaceDictionary) {
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
  dictionary: WorkspaceDictionary;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading, getAuthorizationHeader } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
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
      throw new Error(payload.error ?? "Unable to load project");
    }

    startTransition(() => {
      setProject(payload.project);
      setDocuments(payload.documents);
      setActiveChatId(payload.activeChat.id);
      setSelectedDocumentId((current) => current ?? payload.documents[0]?.id ?? null);
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
      throw new Error(payload.error ?? "Unable to load messages");
    }

    startTransition(() => setMessages(payload.messages));
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    void loadProject().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Unable to load project");
      setLoadingProject(false);
    });
  }, [loading, user, locale, router]);

  useEffect(() => {
    if (!activeChatId || !user) {
      return;
    }

    void loadMessages(activeChatId).catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Unable to load messages");
    });
  }, [activeChatId, user]);

  useEffect(() => {
    if (!documents.some((document) => document.status === "queued" || document.status === "processing")) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadProject().catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Unable to refresh project");
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [documents]);

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
        throw new Error("Unable to load preview");
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      revokedUrl = nextUrl;
      setPreviewUrl(nextUrl);
    }

    void loadPreviewAsset().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Unable to load preview");
    });

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [activeDocument, getAuthorizationHeader, projectId]);

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
        throw new Error(payload.error ?? "Unable to upload documents");
      }

      setDocuments((current) => [...payload.documents!, ...current]);
      setSelectedDocumentId((current) => current ?? payload.documents?.[0]?.id ?? null);
      if (payload.failures?.length) {
        setError(
          payload.failures
            .map((failure) => `${failure.fileName}: ${failure.error}`)
            .join(" | "),
        );
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to upload documents");
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
        throw new Error(payload.error ?? "Unable to send message");
      }

      setActiveChatId(payload.chat.id);
      setMessages((current) => [...current, payload.userMessage!, payload.assistantMessage!]);
      setMessage("");
      setMobileTab("chat");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to send message");
    } finally {
      setBusy(false);
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
      return <p className="text-sm text-[var(--color-ink-soft)]">{dictionary.noPreview}</p>;
    }

    if (activeDocument.status !== "ready") {
      return (
        <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-[var(--color-line)] bg-white/45 p-6 text-center">
          <StatusChip
            status={activeDocument.status}
            label={documentStatusLabel(activeDocument.status, dictionary)}
          />
          <p className="max-w-md text-sm leading-6 text-[var(--color-ink-soft)]">
            {dictionary.unsupportedPreview}
          </p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex h-full min-h-80 items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-line)] bg-white/45 p-6 text-sm text-[var(--color-ink-soft)]">
          Loading preview...
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
          <StatusChip status="processing" label={dictionary.processing} />
          <p className="max-w-md text-sm leading-6 text-[var(--color-ink-soft)]">
            {dictionary.unsupportedPreview}
          </p>
        </div>
      );
    }

    return <iframe className="h-[72vh] w-full rounded-[2rem] border-0 bg-white" src={previewUrl} title={activeDocument.name} />;
  }

  const tabs = [
    { id: "docs", label: dictionary.mobileDocs },
    { id: "preview", label: dictionary.mobilePreview },
    { id: "chat", label: dictionary.mobileChat },
  ] as const;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 pb-8 pt-2 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {dictionary.back}
          </Link>
          <h1 className="display-text mt-2 text-4xl">
            {loadingProject ? "..." : project?.name ?? "Project"}
          </h1>
          {project?.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
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
            {dictionary.upload}
          </Button>
        </div>
      </div>

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
            <h2 className="text-lg font-semibold">{dictionary.documents}</h2>
            <Input
              className="max-w-40 py-2"
              placeholder="Search"
              value={documentsSearch}
              onChange={(event) => setDocumentsSearch(event.target.value)}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{dictionary.processingHint}</p>
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
                        label={documentStatusLabel(document.status, dictionary)}
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
                    {selectedFilters.includes(document.id) ? "Included in chat" : "Add to chat scope"}
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
                {dictionary.noDocuments}
              </p>
            )}
          </div>
        </aside>

        <section className={`glass-panel rounded-[2rem] p-4 ${mobileTab !== "preview" ? "hidden sm:block" : ""}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{dictionary.preview}</h2>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {activeDocument?.name ?? dictionary.noPreview}
              </p>
            </div>
          </div>
          {renderPreview()}
        </section>

        <aside className={`glass-panel rounded-[2rem] p-4 ${mobileTab !== "chat" ? "hidden sm:block" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{dictionary.chat}</h2>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {selectedFilters.length
                  ? `${selectedFilters.length} docs selected`
                  : dictionary.filterAll}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--color-line)] bg-white/70 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-ink-soft)]">
              {dictionary.scopeLabel}
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
                {dictionary.filterAll}
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
                  <p className="text-xs uppercase tracking-[0.25em] opacity-60">{entry.role}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{entry.content}</p>
                  {entry.citations.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-60">
                        {dictionary.citations}
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
                {dictionary.noMessages}
              </div>
            )}
          </div>

          <form className="mt-4 flex gap-2" onSubmit={handleSendMessage}>
            <Input
              placeholder={dictionary.askPlaceholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button disabled={busy || !message.trim()} type="submit">
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </aside>
      </section>
    </main>
  );
}
