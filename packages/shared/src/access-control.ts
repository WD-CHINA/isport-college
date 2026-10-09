import type { WebProfile } from './web-api'

/** 前端路由和菜单的权限名称；实际接口鉴权由学苑后端负责。 */
export const PERMISSIONS = [
  'account:view',
  'creation:use',
  'admin:view',
  'course:manage',
  'content:manage',
  'work:review',
] as const
export type Permission = (typeof PERMISSIONS)[number]

/** 当前 /me 协议不提供角色或权限。有效前台会话仅开放个人中心。 */
export function hasWebPermission(
  profile: Pick<WebProfile, 'id'> | null | undefined,
  permission: Permission,
): boolean {
  return (
    permission === 'account:view' && Number.isSafeInteger(profile?.id) && (profile?.id ?? 0) > 0
  )
}
