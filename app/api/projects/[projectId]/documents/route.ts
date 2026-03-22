import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { projectId } = await context.params;
    const documents = await listDocuments(projectId, user.id);
    return NextResponse.json({ documents });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to list documents", 401);
  }
}
