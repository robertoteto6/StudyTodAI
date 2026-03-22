import { hasFirebaseAdminConfig } from "@/lib/firebase/admin";

export const serverEnv = {
  isFirebaseConfigured: hasFirebaseAdminConfig,
  isPineconeConfigured: Boolean(
    process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME,
  ),
  isOpenRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
  processorUrl: process.env.DOCUMENT_PROCESSOR_URL ?? null,
};
