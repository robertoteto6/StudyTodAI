import { NextResponse } from "next/server";
import { getProjectById, getOrCreateChat, listDocuments } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

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
