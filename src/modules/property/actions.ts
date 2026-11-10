"use server";

import { propertySchema } from "@/modules/property/schema";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  slugExists,
} from "@/modules/property/service";
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

export async function createPropertyAction(formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "properties", "create");

  const raw = Object.fromEntries(formData.entries());
  const parsed = propertySchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug)) {
    return { error: "A property with this slug already exists" };
  }

  try {
    const property = await createProperty(data, userId, ip);
    revalidatePath("/admin/properties");
    return { success: true, property };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create property" };
  }
}

export async function updatePropertyAction(id: string, formData: FormData) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "properties", "edit");

  const raw = Object.fromEntries(formData.entries());
  const parsed = propertySchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const ip = (await headers()).get("x-forwarded-for") || undefined;

  if (await slugExists(data.slug, id)) {
    return { error: "A property with this slug already exists" };
  }

  try {
    const property = await updateProperty(id, data, userId, ip);
    revalidatePath("/admin/properties");
    return { success: true, property };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update property" };
  }
}

export async function deletePropertyAction(id: string) {
  const session = await getAuthSession();
  const userId = getUserId(session);
  if (!userId) {
    return { error: "Unauthorized" };
  }

  await requirePermission(userId, "properties", "delete");

  const ip = (await headers()).get("x-forwarded-for") || undefined;

  try {
    await deleteProperty(id, userId, ip);
    revalidatePath("/admin/properties");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete property" };
  }
}
