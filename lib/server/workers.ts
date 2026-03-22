import { serverEnv } from "@/lib/server/env";
import { processDocumentJob } from "@/lib/server/processing";

export async function dispatchDocumentProcessing(params: { documentId: string; jobId: string }) {
  if (serverEnv.processorUrl) {
    const response = await fetch(serverEnv.processorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Document processor rejected the job (${response.status})`);
    }

    return;
  }

  void processDocumentJob(params);
}
