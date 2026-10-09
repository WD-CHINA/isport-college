import type { Role } from './types'

/**
 * 前端导航与服务端鉴权共享的细粒度权限。
 *
 * 每个权限都必须有真实门禁，禁止只用于菜单可见性：
 * - `account:view`：个人中心（本人资料与教师资料）
 * - `creation:use`：创作中心（概览、我的创作、我的积分）
 * - `admin:view`：管理端工作台
 * - `course:manage` / `content:manage`：管理端课程与内容运营操作
 * - `work:review`：投稿审核（页面尚未交付，服务端已按此权限校验）
 *
 * 路由侧通过页面 `academyGate` 元数据声明。前台接口自行校验登录态。
 */
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
