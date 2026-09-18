/** 支持的语言 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]

/** 默认语言：简体中文 */
export const DEFAULT_LOCALE: LocaleCode = 'zh-CN'

/** 语言偏好 Cookie，确保 SSR 首屏语言与客户端一致 */
export const LOCALE_COOKIE_NAME = 'ic_locale'

/** 登录状态 Cookie，默认有效期 7 天 */
export const AUTH_COOKIE_NAME = 'ic_auth'
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * 路由语言码 → 数据语言码映射。
 * URL 前缀使用短码（/en），业务数据与语言包使用完整码（en-US）。
 */
export function resolveDataLocale(code: string): LocaleCode {
  return code.startsWith('en') ? 'en-US' : 'zh-CN'
}
