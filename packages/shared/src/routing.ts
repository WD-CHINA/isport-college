import type { Permission } from './access-control'
import { LOCALE_URL_PREFIXES } from './constants'

/** 管理端区域的路由前缀（URL 归一化后比较） */
export const ADMIN_ROUTE_PREFIX = '/admin'

/**
 * 声明式路由门禁契约。
 *
 * 页面通过 `definePageMeta({ academyGate })` 声明所需能力，客户端全局门禁与
 * 服务端 Nitro 门禁读取同一份契约，禁止再用路径字符串前缀判断区域。
 *
 * - 管理端区域（URL 归一化后位于 `/admin` 之下）未声明 `permission` 时按 `admin:view` 处理，
 *   即新增管理端页面即使忘记声明也只能被管理员访问，不会静默放开。
 * - `permission` 隐含需要登录；仅需要登录的页面显式声明 `auth: true`。
 */
export interface AcademyRouteGate {
  /** 需要登录；`permission` 存在时隐含为 true */
  auth?: boolean
  /** 所需权限 */
  permission?: Permission
}

/**
 * 去掉路径开头的语言前缀，大小写不敏感。
 * 仅识别 `LOCALE_URL_PREFIXES` 中声明的短码，避免把业务路径误当作语言前缀。
 */
export function stripLocalePrefix(path: string): string {
  const lower = path.toLowerCase()
  for (const prefix of LOCALE_URL_PREFIXES) {
    if (lower === `/${prefix}`) return '/'
    if (lower.startsWith(`/${prefix}/`)) return path.slice(prefix.length + 1)
  }
  return path
}

/**
 * 归一化路由路径，仅用于匹配判断（不做重定向）：
 * 去掉查询串与哈希、语言前缀、尾随斜杠，并统一为小写。
 *
 * vue-router 的路径匹配默认大小写不敏感，而 `to.path` 保留用户输入的原始大小写，
 * 因此任何基于 `to.path` / `event.path` 的区域判断都必须先经过本函数。
 */
export function normalizeRoutePath(path: string): string {
  const [rawPath = '/'] = path.split(/[?#]/)
  const stripped = stripLocalePrefix(rawPath)
  const collapsed = stripped.length > 1 ? stripped.replace(/\/+$/, '') : stripped
  return (collapsed || '/').toLowerCase()
}

/** 归一化路径是否位于管理端区域 */
export function isAdminRoutePath(path: string): boolean {
  const normalized = normalizeRoutePath(path)
  return normalized === ADMIN_ROUTE_PREFIX || normalized.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
}

/** 需要额外 noindex 的私有 C 端路由（管理端另行统一处理） */
export const PRIVATE_ROUTE_PATHS = ['/account', '/creation', '/lingyue'] as const

export function isPrivateRoutePath(path: string): boolean {
  const normalized = normalizeRoutePath(path)
  return PRIVATE_ROUTE_PATHS.some(
    route => normalized === route || normalized.startsWith(`${route}/`),
  )
}
