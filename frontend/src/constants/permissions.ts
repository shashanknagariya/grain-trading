export const Permissions = {
  READ_ALL: 'read:all',
  WRITE_ALL: 'write:all',
  MANAGE_USERS: 'manage:users',
  MANAGE_INVENTORY: 'manage:inventory',
  MAKE_PURCHASE: 'make:purchase',
  MAKE_SALE: 'make:sale',
  VIEW_REPORTS: 'view:reports'
} as const;

export const Roles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const; 