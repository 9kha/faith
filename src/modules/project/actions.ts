"use server";

import { projectSchema } from "@/modules/project/schema";
import {
  createProject,
  updateProject,
  deleteProject,
  slugExists,
  getSmartAddSuggestions,
} from "@/modules/project/service";
import { getAuthSession } from "@/lib/auth";
import type { Session } from "next-auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";

function getUserId(session: Session | null): string | null {
  if (!session?.user) return null;
  const id = (session.user as unknown as { id?: string })?.id;
  return id || null;
}

export async function createProjectAction(formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "projects", "create");

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug)) {
    return { error: "A project with this slug already exists" };
  }

  try {
    const project = await createProject(data, userId, ip);
    revalidatePath("/admin/admin/projects");
    return { success: true, project };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create project" };
  }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "projects", "edit");

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug, id)) {
    return { error: "A project with this slug already exists" };
  }

  try {
    const project = await updateProject(id, data, userId, ip);
    revalidatePath("/admin/admin/projects");
    return { success: true, project };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update project" };
  }
}

export async function deleteProjectAction(id: string) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "projects", "delete");

  const ip = (await headers()).get("x-forwarded-for") || undefined;

  try {
    await deleteProject(id, userId, ip);
    revalidatePath("/admin/admin/projects");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete project" };
  }
}

export async function getSmartAddBuilderSuggestions(builderId?: string) {
  return getSmartAddSuggestions(builderId);
}
