"use server";

import { builderSchema } from "@/modules/builder/schema";
import {
  createBuilder,
  updateBuilder,
  deleteBuilder,
  slugExists,
} from "@/modules/builder/service";
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

export async function createBuilderAction(formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "builders", "create");

  const raw = Object.fromEntries(formData.entries());
  const parsed = builderSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug)) {
    return { error: "A builder with this slug already exists" };
  }

  try {
    const builder = await createBuilder(data as Record<string, unknown>, userId, ip);
    revalidatePath("/admin/admin/builders");
    return { success: true, builder };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create builder" };
  }
}

export async function updateBuilderAction(id: string, formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "builders", "edit");

  const raw = Object.fromEntries(formData.entries());
  const parsed = builderSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug, id)) {
    return { error: "A builder with this slug already exists" };
  }

  try {
    const builder = await updateBuilder(id, data as Record<string, unknown>, userId, ip);
    revalidatePath("/admin/admin/builders");
    return { success: true, builder };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update builder" };
  }
}

export async function deleteBuilderAction(id: string) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "builders", "delete");

  const ip = (await headers()).get("x-forwarded-for") || undefined;

  try {
    await deleteBuilder(id, userId, ip);
    revalidatePath("/admin/admin/builders");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete builder" };
  }
}

export async function validateBuilderSlug(slug: string, excludeId?: string) {
  const exists = await slugExists(slug, excludeId);
  return { available: !exists };
}
