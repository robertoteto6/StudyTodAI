import { getDocumentById } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { readStoredAsset } from "@/lib/server/storage";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string; documentId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { documentId } = await context.params;
    const document = await getDocumentById(documentId, user.id);

    if (!document) {
      return jsonError("Document not found", 404);
    }

    const asset = await readStoredAsset(document.previewPath ?? document.storagePath);

    return new Response(new Uint8Array(asset), {
      headers: {
        "Content-Type": document.mimeType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load asset", 401);
  }
}
