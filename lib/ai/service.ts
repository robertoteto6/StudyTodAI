import { Pinecone } from "@pinecone-database/pinecone";
import { nanoid } from "nanoid";
import { type AIProvider, type ChatMessage, type Citation, type DocumentChunk, type Locale } from "@/lib/types";
import { serverEnv } from "@/lib/server/env";
import { listChunks } from "@/lib/server/data-store";

class OpenRouterProvider implements AIProvider {
  async createEmbeddings(input: { values: string[] }) {
    if (!serverEnv.isOpenRouterConfigured) {
      return input.values.map((value) =>
        Array.from({ length: 12 }, (_, index) =>
          Number((((value.length + 17) * (index + 3)) % 97) / 100),
        ),
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_EMBEDDING_MODEL ?? "text-embedding-3-small",
        input: input.values,
      }),
    });

    if (!response.ok) {
      throw new Error("Embedding request failed");
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
    };

    return data.data.map((item) => item.embedding);
  }

  async generateChatCompletion(input: {
    message: string;
    contextChunks: DocumentChunk[];
    history: ChatMessage[];
    locale: Locale;
    projectName: string;
  }) {
    const citations = input.contextChunks.slice(0, 3).map<Citation>((chunk) => ({
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      pageOrSlide: chunk.pageOrSlide,
      snippet: chunk.text.slice(0, 180),
      previewTarget: `${chunk.documentId}:${chunk.pageOrSlide}`,
    }));

    if (!serverEnv.isOpenRouterConfigured) {
      const intro =
        input.locale === "es"
          ? `He revisado ${input.projectName} y esto es lo más relevante para tu pregunta:`
          : `I reviewed ${input.projectName} and this is the most relevant context for your question:`;
      const bullets = input.contextChunks.slice(0, 3).map((chunk) => `• ${chunk.text.slice(0, 220)}`);
      const fallback =
        bullets.length > 0
          ? `${intro}\n\n${bullets.join("\n")}`
          : input.locale === "es"
            ? "Todavía no tengo suficiente contexto procesado. Sube documentos listos o espera a que termine el procesamiento."
            : "I do not have enough processed context yet. Upload ready documents or wait for processing to finish.";

      return {
        content: fallback,
        citations,
      };
    }

    const systemPrompt =
      input.locale === "es"
        ? "Eres un tutor académico preciso. Responde solo con base en el contexto recuperado y reconoce cuando falte evidencia."
        : "You are a precise academic tutor. Answer strictly from the retrieved context and clearly state when evidence is missing.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...input.history.slice(-6).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          {
            role: "user",
            content: `Project: ${input.projectName}\n\nContext:\n${input.contextChunks
              .map(
                (chunk) =>
                  `[${chunk.documentName} - ${chunk.pageOrSlide}] ${chunk.text}`,
              )
              .join("\n\n")}\n\nQuestion:\n${input.message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Chat completion failed");
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return {
      content:
        data.choices[0]?.message.content ??
        (input.locale === "es" ? "No pude generar una respuesta." : "I could not generate a response."),
      citations,
    };
  }
}

const provider = new OpenRouterProvider();

function scoreChunk(chunk: DocumentChunk, query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.reduce((score, token) => {
    if (chunk.text.toLowerCase().includes(token)) {
      return score + 1;
    }
    return score;
  }, 0);
}

async function queryPinecone(params: {
  projectId: string;
  vector: number[];
  selectedDocumentIds?: string[];
}) {
  if (!serverEnv.isPineconeConfigured) {
    return null;
  }

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  const response = await index.namespace(params.projectId).query({
    vector: params.vector,
    topK: 6,
    includeMetadata: true,
    filter: params.selectedDocumentIds?.length
      ? { documentId: { $in: params.selectedDocumentIds } }
      : undefined,
  });

  return response.matches.map((match) => ({
    id: String(match.id),
    projectId: params.projectId,
    userId: "",
    documentId: String(match.metadata?.documentId ?? ""),
    documentName: String(match.metadata?.documentName ?? "Document"),
    pageOrSlide: String(match.metadata?.pageOrSlide ?? "Section"),
    text: String(match.metadata?.text ?? ""),
  }));
}

export async function indexChunks(projectId: string, chunks: DocumentChunk[]) {
  if (!serverEnv.isPineconeConfigured || chunks.length === 0) {
    return;
  }

  const index = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }).index(
    process.env.PINECONE_INDEX_NAME!,
  );

  await index.namespace(projectId).upsert({
    records: chunks.map((chunk) => ({
      id: chunk.id || nanoid(),
      values: chunk.embedding ?? [],
      metadata: {
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        pageOrSlide: chunk.pageOrSlide,
        text: chunk.text,
      },
    })),
  });
}

export async function retrieveChunks(params: {
  projectId: string;
  userId: string;
  query: string;
  selectedDocumentIds?: string[];
}) {
  const localChunks = await listChunks(params.projectId, params.userId, params.selectedDocumentIds);

  if (!localChunks.length) {
    return [];
  }

  if (serverEnv.isPineconeConfigured && serverEnv.isOpenRouterConfigured) {
    const [vector] = await provider.createEmbeddings({ values: [params.query] });
    const pineconeMatches = await queryPinecone({
      projectId: params.projectId,
      vector,
      selectedDocumentIds: params.selectedDocumentIds,
    });

    if (pineconeMatches?.length) {
      return pineconeMatches;
    }
  }

  return [...localChunks]
    .sort((left, right) => scoreChunk(right, params.query) - scoreChunk(left, params.query))
    .slice(0, 6);
}

export async function answerProjectQuestion(params: {
  projectId: string;
  projectName: string;
  userId: string;
  message: string;
  locale: Locale;
  history: ChatMessage[];
  selectedDocumentIds?: string[];
}) {
  const contextChunks = await retrieveChunks({
    projectId: params.projectId,
    userId: params.userId,
    query: params.message,
    selectedDocumentIds: params.selectedDocumentIds,
  });

  return provider.generateChatCompletion({
    message: params.message,
    contextChunks,
    history: params.history,
    locale: params.locale,
    projectName: params.projectName,
  });
}

export async function createEmbeddings(values: string[]) {
  return provider.createEmbeddings({ values });
}
