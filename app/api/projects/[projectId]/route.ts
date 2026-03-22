import { z } from "zod";
import { NextResponse } from "next/server";
import {
  PROJECT_ACCENT_COLORS,
  PROJECT_ICON_OPTIONS,
  type ProjectIconKey,
} from "@/lib/constants";
import {
  archiveProject,
  deleteProjectCascade,
  getProjectById,
  getOrCreateChat,
  listDocuments,
  restoreProject,
  updateProject,
} from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { deleteStoredAsset } from "@/lib/server/storage";

const projectPatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(240).optional(),
  subject: z.string().max(80).optional(),
  accentColor: z
    .string()
    .refine(
      (value) => PROJECT_ACCENT_COLORS.some((accentColor) => accentColor === value),
      "Invalid accent color",
    )
    .optional(),
  icon: z
    .string()
    .refine(
      (value) => PROJECT_ICON_OPTIONS.some((option) => option.value === value),
      "Invalid project icon",
    )
    .transform((value) => value as ProjectIconKey)
    .optional(),
  isFavorite: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export async function GET(
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

    const documents = await listDocuments(projectId, user.id);
    const activeChat = await getOrCreateChat(projectId, user.id);

    return NextResponse.json({ project, documents, activeChat });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load project", 401);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { projectId } = await context.params;
    const payload = projectPatchSchema.parse(await request.json());
    const project = await getProjectById(projectId, user.id);

    if (!project) {
      return jsonError("Project not found", 404);
    }

    let updatedProject = project;

    if (typeof payload.archived === "boolean") {
      const nextProject = payload.archived
        ? await archiveProject(projectId, user.id)
        : await restoreProject(projectId, user.id);

      if (!nextProject) {
        return jsonError("Project not found", 404);
      }

      updatedProject = nextProject;
    }

    const patch = Object.fromEntries(
      Object.entries({
        name: payload.name,
        description: payload.description,
        subject: payload.subject,
        accentColor: payload.accentColor,
        icon: payload.icon,
        isFavorite: payload.isFavorite,
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(patch).length) {
      const nextProject = await updateProject(projectId, user.id, patch);

      if (!nextProject) {
        return jsonError("Project not found", 404);
      }

      updatedProject = nextProject;
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to update project");
  }
}

export async function DELETE(
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

    if (!project.archivedAt) {
      return jsonError("Archive the project before deleting it permanently", 409);
    }

    const documents = await listDocuments(projectId, user.id);
    const storagePaths = new Set<string>();

    for (const document of documents) {
      if (document.storagePath) {
        storagePaths.add(document.storagePath);
      }
      if (document.previewPath) {
        storagePaths.add(document.previewPath);
      }
    }

    await deleteProjectCascade(projectId, user.id);
    await Promise.allSettled([...storagePaths].map((assetPath) => deleteStoredAsset(assetPath)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to delete project");
  }
}
