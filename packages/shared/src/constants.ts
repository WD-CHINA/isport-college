/** 支持的语言 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]

/** 默认语言：简体中文 */
export const DEFAULT_LOCALE: LocaleCode = 'zh-CN'

/** 语言偏好 localStorage 键（纯客户端存储，SSR 首屏恒为默认语言） */
export const LOCALE_STORAGE_KEY = 'ic_locale'

/** 登录会话 localStorage 键与有效期（秒，默认 7 天），纯客户端存储 */
export const AUTH_STORAGE_KEY = 'ic_auth'
export const AUTH_SESSION_TTL = 60 * 60 * 24 * 7

/**
 * 路由语言码 → 数据语言码映射。
 * URL 前缀使用短码（/en），业务数据与语言包使用完整码（en-US）。
 */
export function resolveDataLocale(code: string): LocaleCode {
  return code.startsWith('en') ? 'en-US' : 'zh-CN'
}
