import { isAdminRoutePath } from '@isport/shared'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * 路由是否位于管理端区域。
 *
 * 判定同时考虑路由记录（`to.matched`，i18n 生成的语言化路径会带 `/en` 前缀）与用户输入的
 * `to.path`，两者都经过 `normalizeRoutePath` 归一化：
 * vue-router 路径匹配大小写不敏感，而 `to.path` 保留原始大小写，直接比较字符串会被
 * `/Admin/courses` 这类变体绕过。
 */
export function isAdminRoute(route: RouteLocationNormalized): boolean {
  return [...route.matched.map(record => record.path), route.path].some(isAdminRoutePath)
}
