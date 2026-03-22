import { NextResponse } from "next/server";
import { listMessages } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string; chatId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { chatId } = await context.params;
    const messages = await listMessages(chatId, user.id);
    return NextResponse.json({ messages });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to list messages", 401);
  }
}
