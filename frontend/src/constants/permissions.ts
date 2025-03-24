export const Permissions = {
  READ_ALL: 'read:all' as const,
  WRITE_ALL: 'write:all' as const,
  MANAGE_USERS: 'manage:users' as const,
  MANAGE_INVENTORY: 'manage:inventory' as const,
  CREATE_PURCHASE: 'create:purchase' as const,
  MAKE_SALE: 'make:sale' as const,
  VIEW_REPORTS: 'view:reports' as const,
} as const;

export const Roles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const;