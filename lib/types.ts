import { type ProjectIconKey } from "@/lib/constants";

export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type LanguageCode = "es" | "en";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider: "firebase" | "demo";
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  subject: string;
  accentColor: string;
  icon: ProjectIconKey;
  isFavorite: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatusFilter = "active" | "archived" | "all";

export type ProjectListItem = {
  project: Project;
  documentCount: number;
  readyDocumentCount: number;
  processingDocumentCount: number;
};

export type DocumentStatus = "queued" | "processing" | "ready" | "error";

export type DocumentRecord = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  mimeType: string;
  storagePath: string;
  previewPath: string | null;
  status: DocumentStatus;
  pageCount: number | null;
  language: LanguageCode | null;
  errorMessage: string | null;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export type Citation = {
  documentId: string;
  documentName: string;
  pageOrSlide: string;
  snippet: string;
  previewTarget: string;
};

export type ChatSession = {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  chatId: string;
  projectId: string;
  userId: string;
  role: ChatRole;
  content: string;
  citations: Citation[];
  createdAt: string;
};

export type ProcessingJobStatus = "queued" | "running" | "completed" | "failed";

export type ProcessingJob = {
  id: string;
  documentId: string;
  projectId: string;
  userId: string;
  status: ProcessingJobStatus;
  stage: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentChunk = {
  id: string;
  projectId: string;
  userId: string;
  documentId: string;
  documentName: string;
  pageOrSlide: string;
  text: string;
  embedding?: number[];
};

export type ProjectDetail = {
  project: Project;
  documents: DocumentRecord[];
  chats: ChatSession[];
};

export type ProjectInput = {
  name: string;
  description: string;
  subject: string;
  accentColor: string;
  icon: ProjectIconKey;
};

export type AIProvider = {
  generateChatCompletion(input: {
    message: string;
    contextChunks: DocumentChunk[];
    history: ChatMessage[];
    locale: Locale;
    projectName: string;
  }): Promise<{
    content: string;
    citations: Citation[];
  }>;
  createEmbeddings(input: { values: string[] }): Promise<number[][]>;
};
