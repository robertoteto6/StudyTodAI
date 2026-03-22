import { z } from "zod";
import { answerProjectQuestion } from "@/lib/ai/service";
import {
  createMessage,
  getOrCreateChat,
  getProjectById,
  listMessages,
  touchProject,
} from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { getSafeLocale } from "@/lib/i18n/config";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  selectedDocumentIds: z.array(z.string()).optional(),
  locale: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireRequestUser(request);
    const { projectId } = await context.params;
    const payload = chatSchema.parse(await request.json());
    const project = await getProjectById(projectId, user.id);

    if (!project) {
      return jsonError("Project not found", 404);
    }

    const chat = await getOrCreateChat(projectId, user.id);
    const history = await listMessages(chat.id, user.id);
    const userMessage = await createMessage({
      chatId: chat.id,
      projectId,
      userId: user.id,
      role: "user",
      content: payload.message,
      citations: [],
    });
    const response = await answerProjectQuestion({
      projectId,
      projectName: project.name,
      userId: user.id,
      message: payload.message,
      locale: getSafeLocale(payload.locale ?? "es"),
      history: [...history, userMessage],
      selectedDocumentIds: payload.selectedDocumentIds,
    });
    const assistantMessage = await createMessage({
      chatId: chat.id,
      projectId,
      userId: user.id,
      role: "assistant",
      content: response.content,
      citations: response.citations,
    });

    await touchProject(projectId, user.id);

    return Response.json({ chat, userMessage, assistantMessage });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to generate answer");
  }
}
