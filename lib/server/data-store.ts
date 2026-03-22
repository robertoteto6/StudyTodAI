import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { DEFAULT_CHAT_TITLE } from "@/lib/constants";
import { nowIso, safeJsonParse } from "@/lib/utils";
import {
  type AuthUser,
  type ChatMessage,
  type ChatSession,
  type DocumentChunk,
  type DocumentRecord,
  type ProcessingJob,
  type Project,
  type ProjectListItem,
  type ProjectStatusFilter,
  type ProjectInput,
} from "@/lib/types";

type DemoDatabase = {
  users: AuthUser[];
  projects: Project[];
  documents: DocumentRecord[];
  chats: ChatSession[];
  messages: ChatMessage[];
  processing_jobs: ProcessingJob[];
  document_chunks: DocumentChunk[];
};

const runtimeDirectory = path.join(process.cwd(), ".runtime");
const databasePath = path.join(runtimeDirectory, "demo-db.json");

const emptyDatabase: DemoDatabase = {
  users: [],
  projects: [],
  documents: [],
  chats: [],
  messages: [],
  processing_jobs: [],
  document_chunks: [],
};

async function ensureDemoDatabase() {
  await fs.mkdir(runtimeDirectory, { recursive: true });
  try {
    await fs.access(databasePath);
  } catch {
    await fs.writeFile(databasePath, JSON.stringify(emptyDatabase, null, 2), "utf8");
  }
}

async function readDemoDatabase() {
  await ensureDemoDatabase();
  const file = await fs.readFile(databasePath, "utf8");
  return safeJsonParse(file, emptyDatabase);
}

async function writeDemoDatabase(data: DemoDatabase) {
  await ensureDemoDatabase();
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    isFavorite: project.isFavorite ?? false,
    archivedAt: project.archivedAt ?? null,
  };
}

function filterProjectsByStatus(projects: Project[], status: ProjectStatusFilter) {
  if (status === "all") {
    return projects;
  }

  return projects.filter((project) =>
    status === "archived" ? Boolean(project.archivedAt) : !project.archivedAt,
  );
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function summarizeProjects(projects: Project[], documents: DocumentRecord[]): ProjectListItem[] {
  const metrics = new Map<
    string,
    { documentCount: number; readyDocumentCount: number; processingDocumentCount: number }
  >();

  for (const document of documents) {
    const current = metrics.get(document.projectId) ?? {
      documentCount: 0,
      readyDocumentCount: 0,
      processingDocumentCount: 0,
    };

    current.documentCount += 1;
    if (document.status === "ready") {
      current.readyDocumentCount += 1;
    }
    if (document.status === "queued" || document.status === "processing") {
      current.processingDocumentCount += 1;
    }

    metrics.set(document.projectId, current);
  }

  return projects.map((project) => {
    const current = metrics.get(project.id) ?? {
      documentCount: 0,
      readyDocumentCount: 0,
      processingDocumentCount: 0,
    };

    return {
      project,
      ...current,
    };
  });
}

export async function upsertUser(user: AuthUser) {
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("users").doc(user.id).set(user, { merge: true });
    return;
  }

  const db = await readDemoDatabase();
  const existingIndex = db.users.findIndex((item) => item.id === user.id);

  if (existingIndex === -1) {
    db.users.push(user);
  } else {
    db.users[existingIndex] = user;
  }

  await writeDemoDatabase(db);
}

export async function createProject(user: AuthUser, input: ProjectInput) {
  const now = nowIso();
  const project: Project = {
    id: nanoid(),
    userId: user.id,
    name: input.name,
    description: input.description,
    subject: input.subject,
    accentColor: input.accentColor,
    isFavorite: false,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("projects").doc(project.id).set(project);
    return project;
  }

  const db = await readDemoDatabase();
  db.projects.push(project);
  await writeDemoDatabase(db);
  return project;
}

export async function listProjects(
  userId: string,
  status: ProjectStatusFilter = "active",
) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore
      .collection("projects")
      .where("userId", "==", userId)
      .get();

    return sortProjects(
      filterProjectsByStatus(
        snapshot.docs.map((doc) => normalizeProject(doc.data() as Project)),
        status,
      ),
    );
  }

  const db = await readDemoDatabase();
  return sortProjects(
    filterProjectsByStatus(
      db.projects
        .filter((project) => project.userId === userId)
        .map((project) => normalizeProject(project)),
      status,
    ),
  );
}

export async function listProjectListItems(
  userId: string,
  status: ProjectStatusFilter = "active",
) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const [projectsSnapshot, documentsSnapshot] = await Promise.all([
      firestore.collection("projects").where("userId", "==", userId).get(),
      firestore.collection("documents").where("userId", "==", userId).get(),
    ]);

    const projects = sortProjects(
      filterProjectsByStatus(
        projectsSnapshot.docs.map((doc) => normalizeProject(doc.data() as Project)),
        status,
      ),
    );

    return summarizeProjects(
      projects,
      documentsSnapshot.docs.map((doc) => doc.data() as DocumentRecord),
    );
  }

  const db = await readDemoDatabase();
  const projects = sortProjects(
    filterProjectsByStatus(
      db.projects
        .filter((project) => project.userId === userId)
        .map((project) => normalizeProject(project)),
      status,
    ),
  );

  return summarizeProjects(
    projects,
    db.documents.filter((document) => document.userId === userId),
  );
}

export async function getProjectById(projectId: string, userId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore.collection("projects").doc(projectId).get();
    const project = snapshot.data() as Project | undefined;
    if (!project || project.userId !== userId) {
      return null;
    }
    return normalizeProject(project);
  }

  const db = await readDemoDatabase();
  const project = db.projects.find((item) => item.id === projectId && item.userId === userId);
  return project ? normalizeProject(project) : null;
}

export async function touchProject(projectId: string, userId: string) {
  const firestore = getAdminFirestore();
  const updatedAt = nowIso();

  if (firestore) {
    await firestore.collection("projects").doc(projectId).set({ updatedAt }, { merge: true });
    return;
  }

  const db = await readDemoDatabase();
  const project = db.projects.find((item) => item.id === projectId && item.userId === userId);
  if (project) {
    project.updatedAt = updatedAt;
    await writeDemoDatabase(db);
  }
}

type ProjectPatch = Partial<
  Pick<Project, "name" | "description" | "subject" | "accentColor" | "isFavorite" | "archivedAt">
>;

export async function updateProject(
  projectId: string,
  userId: string,
  patch: ProjectPatch,
) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const reference = firestore.collection("projects").doc(projectId);
    const snapshot = await reference.get();
    const project = snapshot.data() as Project | undefined;

    if (!project || project.userId !== userId) {
      return null;
    }

    const nextProject = normalizeProject({
      ...project,
      ...patch,
      updatedAt: nowIso(),
    });

    await reference.set(nextProject, { merge: true });
    return nextProject;
  }

  const db = await readDemoDatabase();
  const index = db.projects.findIndex((item) => item.id === projectId && item.userId === userId);

  if (index === -1) {
    return null;
  }

  db.projects[index] = normalizeProject({
    ...db.projects[index],
    ...patch,
    updatedAt: nowIso(),
  });

  await writeDemoDatabase(db);
  return db.projects[index];
}

export async function archiveProject(projectId: string, userId: string) {
  return updateProject(projectId, userId, {
    archivedAt: nowIso(),
    isFavorite: false,
  });
}

export async function restoreProject(projectId: string, userId: string) {
  return updateProject(projectId, userId, {
    archivedAt: null,
  });
}

export async function deleteProjectCascade(projectId: string, userId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const project = await getProjectById(projectId, userId);

    if (!project) {
      return null;
    }

    const [documentsSnapshot, chatsSnapshot, messagesSnapshot, jobsSnapshot, chunksSnapshot] =
      await Promise.all([
        firestore.collection("documents").where("projectId", "==", projectId).where("userId", "==", userId).get(),
        firestore.collection("chats").where("projectId", "==", projectId).where("userId", "==", userId).get(),
        firestore.collection("messages").where("projectId", "==", projectId).where("userId", "==", userId).get(),
        firestore.collection("processing_jobs").where("projectId", "==", projectId).where("userId", "==", userId).get(),
        firestore.collection("document_chunks").where("projectId", "==", projectId).where("userId", "==", userId).get(),
      ]);

    const deleteTargets = [
      firestore.collection("projects").doc(projectId),
      ...documentsSnapshot.docs.map((doc) => doc.ref),
      ...chatsSnapshot.docs.map((doc) => doc.ref),
      ...messagesSnapshot.docs.map((doc) => doc.ref),
      ...jobsSnapshot.docs.map((doc) => doc.ref),
      ...chunksSnapshot.docs.map((doc) => doc.ref),
    ];

    for (let index = 0; index < deleteTargets.length; index += 450) {
      const batch = firestore.batch();

      deleteTargets.slice(index, index + 450).forEach((reference) => {
        batch.delete(reference);
      });

      await batch.commit();
    }

    return project;
  }

  const db = await readDemoDatabase();
  const project = db.projects.find((item) => item.id === projectId && item.userId === userId) ?? null;

  if (!project) {
    return null;
  }

  const chatIds = new Set(
    db.chats
      .filter((chat) => chat.projectId === projectId && chat.userId === userId)
      .map((chat) => chat.id),
  );

  db.projects = db.projects.filter((item) => !(item.id === projectId && item.userId === userId));
  db.documents = db.documents.filter(
    (document) => !(document.projectId === projectId && document.userId === userId),
  );
  db.processing_jobs = db.processing_jobs.filter(
    (job) => !(job.projectId === projectId && job.userId === userId),
  );
  db.document_chunks = db.document_chunks.filter(
    (chunk) => !(chunk.projectId === projectId && chunk.userId === userId),
  );
  db.chats = db.chats.filter((chat) => !(chat.projectId === projectId && chat.userId === userId));
  db.messages = db.messages.filter(
    (message) =>
      !(message.projectId === projectId && message.userId === userId) &&
      !chatIds.has(message.chatId),
  );
  await writeDemoDatabase(db);

  return project;
}

export async function createDocument(input: Omit<DocumentRecord, "id" | "createdAt" | "updatedAt">) {
  const now = nowIso();
  const document: DocumentRecord = {
    ...input,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("documents").doc(document.id).set(document);
    return document;
  }

  const db = await readDemoDatabase();
  db.documents.push(document);
  await writeDemoDatabase(db);
  return document;
}

export async function updateDocument(documentId: string, patch: Partial<DocumentRecord>) {
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore
      .collection("documents")
      .doc(documentId)
      .set({ ...patch, updatedAt: nowIso() }, { merge: true });
    return;
  }

  const db = await readDemoDatabase();
  const document = db.documents.find((item) => item.id === documentId);
  if (document) {
    Object.assign(document, patch, { updatedAt: nowIso() });
    await writeDemoDatabase(db);
  }
}

export async function deleteDocument(documentId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("documents").doc(documentId).delete();
    return;
  }

  const db = await readDemoDatabase();
  db.documents = db.documents.filter((item) => item.id !== documentId);
  await writeDemoDatabase(db);
}

export async function listDocuments(projectId: string, userId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore
      .collection("documents")
      .where("projectId", "==", projectId)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as DocumentRecord);
  }

  const db = await readDemoDatabase();
  return db.documents
    .filter((document) => document.projectId === projectId && document.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getDocumentById(documentId: string, userId?: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore.collection("documents").doc(documentId).get();
    const document = snapshot.data() as DocumentRecord | undefined;
    if (!document || (userId && document.userId !== userId)) {
      return null;
    }
    return document;
  }

  const db = await readDemoDatabase();
  return (
    db.documents.find(
      (document) => document.id === documentId && (!userId || document.userId === userId),
    ) ?? null
  );
}

export async function createProcessingJob(
  input: Omit<ProcessingJob, "id" | "createdAt" | "updatedAt">,
) {
  const now = nowIso();
  const job: ProcessingJob = {
    ...input,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("processing_jobs").doc(job.id).set(job);
    return job;
  }

  const db = await readDemoDatabase();
  db.processing_jobs.push(job);
  await writeDemoDatabase(db);
  return job;
}

export async function updateProcessingJob(jobId: string, patch: Partial<ProcessingJob>) {
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore
      .collection("processing_jobs")
      .doc(jobId)
      .set({ ...patch, updatedAt: nowIso() }, { merge: true });
    return;
  }

  const db = await readDemoDatabase();
  const job = db.processing_jobs.find((item) => item.id === jobId);
  if (job) {
    Object.assign(job, patch, { updatedAt: nowIso() });
    await writeDemoDatabase(db);
  }
}

export async function deleteProcessingJob(jobId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("processing_jobs").doc(jobId).delete();
    return;
  }

  const db = await readDemoDatabase();
  db.processing_jobs = db.processing_jobs.filter((item) => item.id !== jobId);
  await writeDemoDatabase(db);
}

export async function getOrCreateChat(projectId: string, userId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore
      .collection("chats")
      .where("projectId", "==", projectId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    const existing = snapshot.docs[0]?.data() as ChatSession | undefined;
    if (existing) {
      return existing;
    }

    const now = nowIso();
    const chat: ChatSession = {
      id: nanoid(),
      projectId,
      userId,
      title: DEFAULT_CHAT_TITLE,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection("chats").doc(chat.id).set(chat);
    return chat;
  }

  const db = await readDemoDatabase();
  const existing = db.chats.find((chat) => chat.projectId === projectId && chat.userId === userId);

  if (existing) {
    return existing;
  }

  const now = nowIso();
  const chat: ChatSession = {
    id: nanoid(),
    projectId,
    userId,
    title: DEFAULT_CHAT_TITLE,
    createdAt: now,
    updatedAt: now,
  };
  db.chats.push(chat);
  await writeDemoDatabase(db);
  return chat;
}

export async function listMessages(chatId: string, userId: string) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore
      .collection("messages")
      .where("chatId", "==", chatId)
      .where("userId", "==", userId)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as ChatMessage);
  }

  const db = await readDemoDatabase();
  return db.messages
    .filter((message) => message.chatId === chatId && message.userId === userId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function createMessage(input: Omit<ChatMessage, "id" | "createdAt">) {
  const message: ChatMessage = {
    ...input,
    id: nanoid(),
    createdAt: nowIso(),
  };
  const firestore = getAdminFirestore();

  if (firestore) {
    await firestore.collection("messages").doc(message.id).set(message);
    await firestore.collection("chats").doc(message.chatId).set(
      {
        updatedAt: message.createdAt,
      },
      { merge: true },
    );
    return message;
  }

  const db = await readDemoDatabase();
  db.messages.push(message);
  const chat = db.chats.find((item) => item.id === message.chatId);
  if (chat) {
    chat.updatedAt = message.createdAt;
  }
  await writeDemoDatabase(db);
  return message;
}

export async function replaceDocumentChunks(documentId: string, chunks: DocumentChunk[]) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const batch = firestore.batch();
    const existing = await firestore
      .collection("document_chunks")
      .where("documentId", "==", documentId)
      .get();

    existing.forEach((doc) => batch.delete(doc.ref));
    chunks.forEach((chunk) => {
      batch.set(firestore.collection("document_chunks").doc(chunk.id), chunk);
    });

    await batch.commit();
    return;
  }

  const db = await readDemoDatabase();
  db.document_chunks = db.document_chunks.filter((chunk) => chunk.documentId !== documentId);
  db.document_chunks.push(...chunks);
  await writeDemoDatabase(db);
}

export async function listChunks(projectId: string, userId: string, selectedDocumentIds?: string[]) {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snapshot = await firestore
      .collection("document_chunks")
      .where("projectId", "==", projectId)
      .where("userId", "==", userId)
      .get();

    const chunks = snapshot.docs.map((doc) => doc.data() as DocumentChunk);
    return selectedDocumentIds?.length
      ? chunks.filter((chunk) => selectedDocumentIds.includes(chunk.documentId))
      : chunks;
  }

  const db = await readDemoDatabase();
  const chunks = db.document_chunks.filter(
    (chunk) => chunk.projectId === projectId && chunk.userId === userId,
  );
  return selectedDocumentIds?.length
    ? chunks.filter((chunk) => selectedDocumentIds.includes(chunk.documentId))
    : chunks;
}
