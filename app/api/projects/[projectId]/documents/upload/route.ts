import { z } from "zod";
import { MAX_FILE_SIZE_BYTES, SUPPORTED_DOCUMENT_MIME_TYPES } from "@/lib/constants";
import {
  createDocument,
  createProcessingJob,
  deleteDocument,
  deleteProcessingJob,
  getProjectById,
  touchProject,
  updateDocument,
} from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { deleteStoredAsset, saveUpload } from "@/lib/server/storage";
import { dispatchDocumentProcessing } from "@/lib/server/workers";

const fileSchema = z.object({
  name: z.string().min(1),
  type: z.string().refine((value) => SUPPORTED_DOCUMENT_MIME_TYPES.has(value), "Unsupported file type"),
  size: z.number().max(MAX_FILE_SIZE_BYTES),
});

type UploadFailure = {
  fileName: string;
  error: string;
};

async function cleanupFailedUpload(params: {
  documentId: string | null;
  jobId: string | null;
  storagePath: string | null;
}) {
  if (params.jobId) {
    await deleteProcessingJob(params.jobId);
  }

  if (params.documentId) {
    await deleteDocument(params.documentId);
  }

  if (params.storagePath) {
    await deleteStoredAsset(params.storagePath);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { projectId } = await context.params;
    const project = await getProjectById(projectId, user.id);

    if (!project) {
      return jsonError("Project not found", 404);
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);

    if (!files.length) {
      return jsonError("Missing files");
    }

    const createdDocuments = [];
    const failures: UploadFailure[] = [];

    for (const file of files) {
      let documentId: string | null = null;
      let jobId: string | null = null;
      let storagePath: string | null = null;

      try {
        fileSchema.parse({ name: file.name, type: file.type, size: file.size });

        const document = await createDocument({
          projectId,
          userId: user.id,
          name: file.name,
          mimeType: file.type,
          storagePath: "",
          previewPath: null,
          status: "queued",
          pageCount: null,
          language: null,
          errorMessage: null,
          sizeBytes: file.size,
        });
        documentId = document.id;

        const upload = await saveUpload({
          userId: user.id,
          projectId,
          documentId: document.id,
          fileName: file.name,
          contentType: file.type,
          buffer: Buffer.from(await file.arrayBuffer()),
        });
        storagePath = upload.storagePath;

        const finalDocument = {
          ...document,
          storagePath: upload.storagePath,
          previewPath: upload.previewPath,
        };

        await updateDocument(document.id, {
          storagePath: upload.storagePath,
          previewPath: upload.previewPath,
        });

        const job = await createProcessingJob({
          projectId,
          documentId: finalDocument.id,
          userId: user.id,
          status: "queued",
          stage: "uploaded",
          errorMessage: null,
        });
        jobId = job.id;

        await dispatchDocumentProcessing({ documentId: finalDocument.id, jobId: job.id });
        createdDocuments.push(finalDocument);
      } catch (error) {
        await cleanupFailedUpload({ documentId, jobId, storagePath });
        failures.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : "Unable to upload file",
        });
      }
    }

    if (createdDocuments.length) {
      await touchProject(projectId, user.id);
    }

    if (!createdDocuments.length) {
      return jsonError(failures[0]?.error ?? "Unable to upload files");
    }

    return Response.json(
      { documents: createdDocuments, failures },
      { status: failures.length ? 207 : 201 },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to upload files");
  }
}
