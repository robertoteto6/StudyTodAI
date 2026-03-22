import { z } from "zod";
import { NextResponse } from "next/server";
import { PROJECT_ACCENT_COLORS } from "@/lib/constants";
import { createProject, listProjects, upsertUser } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

const projectSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).default(""),
  subject: z.string().max(80).default(""),
  accentColor: z
    .string()
    .refine((value) => PROJECT_ACCENT_COLORS.includes(value), "Invalid accent color"),
});

export async function GET(request: Request) {
  try {
    const user = await requireRequestUser(request);
    await upsertUser(user);
    const projects = await listProjects(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to list projects", 401);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRequestUser(request);
    await upsertUser(user);
    const payload = projectSchema.parse(await request.json());
    const project = await createProject(user, payload);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create project");
  }
}
