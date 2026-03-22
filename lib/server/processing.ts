import path from "node:path";
import { nanoid } from "nanoid";
import { createEmbeddings, indexChunks } from "@/lib/ai/service";
import {
  getDocumentById,
  replaceDocumentChunks,
  updateDocument,
  updateProcessingJob,
} from "@/lib/server/data-store";
import { readStoredAsset } from "@/lib/server/storage";
import { type DocumentChunk, type LanguageCode } from "@/lib/types";

function buildChunk(text: string, length = 650) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += length) {
    chunks.push(normalized.slice(index, index + length));
  }
  return chunks;
}

function inferLanguage(name: string): LanguageCode {
  return /tema|clase|unidad|apuntes/i.test(name) ? "es" : "en";
}

async function extractDemoText(documentId: string) {
  return `Document ${documentId} is ready for semantic retrieval. This demo extraction stores filename-driven context so the chat and citation flow can be exercised before wiring OCR, PDF parsing, and Office conversion services.`;
}

export async function processDocumentJob(params: { documentId: string; jobId: string }) {
  const document = await getDocumentById(params.documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  try {
    await updateDocument(document.id, { status: "processing", errorMessage: null });
    await updateProcessingJob(params.jobId, { status: "running", stage: "extracting" });

    await readStoredAsset(document.storagePath);

    const extractedText = await extractDemoText(document.id);
    const rawChunks = buildChunk(
      `${document.name}. ${path.extname(document.name).slice(1).toUpperCase()} material. ${extractedText}`,
    );
    const embeddings = await createEmbeddings(rawChunks);

    const chunks: DocumentChunk[] = rawChunks.map((text, index) => ({
      id: nanoid(),
      projectId: document.projectId,
      userId: document.userId,
      documentId: document.id,
      documentName: document.name,
      pageOrSlide: `Page ${index + 1}`,
      text,
      embedding: embeddings[index],
    }));

    await replaceDocumentChunks(document.id, chunks);
    await indexChunks(document.projectId, chunks);
    await updateDocument(document.id, {
      status: "ready",
      pageCount: chunks.length,
      language: inferLanguage(document.name),
      previewPath: document.previewPath ?? document.storagePath,
    });
    await updateProcessingJob(params.jobId, { status: "completed", stage: "indexed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    await updateDocument(params.documentId, { status: "error", errorMessage: message });
    await updateProcessingJob(params.jobId, {
      status: "failed",
      stage: "failed",
      errorMessage: message,
    });
  }
}
