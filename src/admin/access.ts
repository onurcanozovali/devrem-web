export const adminRoles = [
  'super_admin',
  'moderator',
  'content_editor',
  'support',
] as const;

export type AdminRole = (typeof adminRoles)[number];

export const permissions = [
  'dashboard.read',
  'blog.read',
  'blog.write',
  'web.read',
  'users.read',
  'users.moderate',
  'reports.read',
  'reports.moderate',
  'groups.read',
  'groups.manage',
  'units.read',
  'units.write',
  'notifications.read',
  'notifications.test',
  'notifications.broadcast',
  'appConfig.read',
  'appConfig.write',
  'analytics.read',
  'admins.read',
  'admins.write',
  'audit.read',
] as const;

export type AdminPermission = (typeof permissions)[number];

export type AdminIdentity = {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  provider: 'firebase' | 'legacy';
};

export const adminRoleLabels: Record<AdminRole, string> = {
  super_admin: 'Süper Admin',
  moderator: 'Moderatör',
  content_editor: 'İçerik Editörü',
  support: 'Destek',
};

const rolePermissions: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: permissions,
  moderator: [
    'dashboard.read',
    'users.read',
    'users.moderate',
    'reports.read',
    'reports.moderate',
    'groups.read',
    'groups.manage',
    'units.read',
    'notifications.read',
    'notifications.test',
    'analytics.read',
    'audit.read',
  ],
  content_editor: [
    'dashboard.read',
    'blog.read',
    'blog.write',
    'web.read',
    'units.read',
    'units.write',
  ],
  support: [
    'dashboard.read',
    'users.read',
    'reports.read',
    'groups.read',
  ],
};

export function isAdminRole(value: unknown): value is AdminRole {
  return adminRoles.includes(value as AdminRole);
}

export function hasPermission(
  identity: Pick<AdminIdentity, 'role'>,
  permission: AdminPermission,
) {
  return rolePermissions[identity.role].includes(permission);
}

export function permissionsForRole(role: AdminRole) {
  return rolePermissions[role];
}

export function canChangeFinalSuperAdmin({
  targetRole,
  nextRole,
  superAdminCount,
}: {
  targetRole: AdminRole | null;
  nextRole: AdminRole | null;
  superAdminCount: number;
}) {
  return !(
    targetRole === 'super_admin' &&
    nextRole !== 'super_admin' &&
    superAdminCount <= 1
  );
}
