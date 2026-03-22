import { promises as fs } from "node:fs";
import path from "node:path";
import { getAdminStorage } from "@/lib/firebase/admin";

const uploadsDirectory = path.join(process.cwd(), ".runtime", "uploads");

async function ensureUploadsDirectory() {
  await fs.mkdir(uploadsDirectory, { recursive: true });
}

export async function saveUpload(params: {
  userId: string;
  projectId: string;
  documentId: string;
  fileName: string;
  contentType: string;
  buffer: Buffer;
}) {
  const storage = getAdminStorage();
  const safeName = params.fileName.replace(/[^\w.\-]+/g, "-");
  const storagePath = `${params.userId}/${params.projectId}/${params.documentId}/${safeName}`;

  if (storage) {
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    await file.save(params.buffer, {
      metadata: {
        contentType: params.contentType,
      },
      resumable: false,
    });
    return { storagePath, previewPath: storagePath };
  }

  await ensureUploadsDirectory();
  const absolutePath = path.join(uploadsDirectory, storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, params.buffer);

  return { storagePath, previewPath: storagePath };
}

export async function readStoredAsset(assetPath: string) {
  const storage = getAdminStorage();

  if (storage) {
    const file = storage.bucket().file(assetPath);
    const [content] = await file.download();
    return content;
  }

  return fs.readFile(path.join(uploadsDirectory, assetPath));
}

export async function deleteStoredAsset(assetPath: string) {
  const storage = getAdminStorage();

  if (storage) {
    await storage.bucket().file(assetPath).delete({ ignoreNotFound: true });
    return;
  }

  try {
    await fs.unlink(path.join(uploadsDirectory, assetPath));
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }
}
