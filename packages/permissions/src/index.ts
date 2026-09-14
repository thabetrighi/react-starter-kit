export type Permission = string;
export type Role = string;

export type AccessPolicy = {
  roles: readonly Role[];
  permissions: readonly Permission[];
};

export type PermissionContext = {
  role?: Role | null;
  permissions?: readonly Permission[];
};

export function hasPermission(
  context: PermissionContext,
  permission: Permission,
): boolean {
  return context.permissions?.includes(permission) ?? false;
}

export function hasRole(context: PermissionContext, role: Role): boolean {
  return context.role === role;
}

export function can(
  context: PermissionContext,
  permission: Permission,
): boolean {
  return hasPermission(context, permission);
}

export function definePolicy(
  roles: readonly Role[],
  permissions: readonly Permission[],
): AccessPolicy {
  return { roles, permissions };
}
