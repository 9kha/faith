import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type ActivityLogAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH";

export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  before,
  after,
  ip,
}: {
  userId?: string;
  action: ActivityLogAction;
  entity: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
}) {
  return db.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      before: before ? (before as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      after: after ? (after as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      ip,
    },
  });
}
