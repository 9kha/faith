import { db } from "./db";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

export type Module =
  | "dashboard"
  | "builders"
  | "projects"
  | "properties"
  | "inventory"
  | "leads"
  | "clients"
  | "sales"
  | "payments"
  | "commissions"
  | "partners"
  | "staff"
  | "media"
  | "pages"
  | "menus"
  | "branding"
  | "seo"
  | "blog"
  | "settings";

export async function hasPermission(
  roleId: string,
  module: Module,
  action: PermissionAction
): Promise<boolean> {
  const rolePermission = await db.rolePermission.findFirst({
    where: {
      roleId,
      granted: true,
      permission: {
        module,
        action,
      },
    },
  });
  return !!rolePermission;
}

export async function getUserPermissions(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
            where: { granted: true },
          },
        },
      },
    },
  });

  if (!user) return [];

  return user.role.permissions.map((rp) => ({
    module: rp.permission.module,
    action: rp.permission.action,
  }));
}

export async function requirePermission(
  userId: string,
  module: Module,
  action: PermissionAction
): Promise<void> {
  const allowed = await hasPermission(userId, module, action);
  if (!allowed) {
    throw new Error(`Permission denied: ${module}:${action}`);
  }
}

export const ROLE_SUPER_ADMIN = "super-admin";
export const ROLE_MANAGER = "manager";
export const ROLE_SALES_EXECUTIVE = "sales-executive";
export const ROLE_CONTENT_MANAGER = "content-manager";
export const ROLE_ACCOUNTANT = "accountant";
export const ROLE_PARTNER = "partner";
