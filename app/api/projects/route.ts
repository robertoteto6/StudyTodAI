import { z } from "zod";
import { NextResponse } from "next/server";
import {
  DEFAULT_PROJECT_ICON,
  PROJECT_ACCENT_COLORS,
  PROJECT_ICON_OPTIONS,
  type ProjectIconKey,
} from "@/lib/constants";
import { createProject, listProjectListItems, upsertUser } from "@/lib/server/data-store";
import { requireRequestUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

const statusSchema = z.enum(["active", "archived", "all"]);

const projectSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).default(""),
  subject: z.string().max(80).default(""),
  accentColor: z
    .string()
    .refine(
      (value) => PROJECT_ACCENT_COLORS.some((accentColor) => accentColor === value),
      "Invalid accent color",
    ),
  icon: z
    .string()
    .refine(
      (value) => PROJECT_ICON_OPTIONS.some((option) => option.value === value),
      "Invalid project icon",
    )
    .transform((value) => value as ProjectIconKey)
    .default(DEFAULT_PROJECT_ICON),
});

export async function GET(request: Request) {
  try {
    const user = await requireRequestUser(request);
    await upsertUser(user);
    const { searchParams } = new URL(request.url);
    const status = statusSchema.parse(searchParams.get("status") ?? "active");
    const projects = await listProjectListItems(user.id, status);
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
