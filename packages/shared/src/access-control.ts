import type { Role } from './types'

/** 前端导航与服务端鉴权共享的细粒度权限。 */
export const PERMISSIONS = [
  'account:view',
  'creation:use',
  'admin:view',
  'course:manage',
  'content:manage',
  'work:review',
] as const

export type Permission = (typeof PERMISSIONS)[number]

/**
 * 角色只负责聚合权限；admin 始终拥有完整权限集合。
 * reviewer/operator 演示账号同时具有 user 角色，因此会继承普通用户能力。
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  user: ['account:view', 'creation:use'],
  reviewer: ['work:review'],
  operator: ['admin:view', 'course:manage', 'content:manage'],
  admin: PERMISSIONS,
}

export function hasPermission(
  roles: readonly Role[] | null | undefined,
  permission: Permission,
): boolean {
  return roles?.some(role => ROLE_PERMISSIONS[role]?.includes(permission)) ?? false
}
