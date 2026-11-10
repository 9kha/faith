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
  targetId: string,
  module: Module,
  action: PermissionAction
): Promise<boolean> {
  // Check if targetId is a userId
  const user = await db.user.findUnique({
    where: { id: targetId },
    include: { role: true },
  });

  const roleId = user ? user.roleId : targetId;
  const roleName = user?.role?.name;

  // Super Admin always has full access to all modules and actions
  if (
    roleName === "Super Admin" ||
    roleName === "super-admin" ||
    roleName === "admin" ||
    roleName === "superadmin" ||
    (user?.role && user.role.level >= 90)
  ) {
    return true;
  }

  // If targetId was directly a roleId or role name
  const role = user?.role || (await db.role.findFirst({
    where: {
      OR: [{ id: roleId }, { name: roleId }],
    },
  }));

  if (
    role &&
    (role.name === "Super Admin" ||
      role.name === "super-admin" ||
      role.name === "admin" ||
      role.name === "superadmin" ||
      role.level >= 90)
  ) {
    return true;
  }

  const effectiveRoleId = role?.id || roleId;

  const rolePermission = await db.rolePermission.findFirst({
    where: {
      roleId: effectiveRoleId,
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
