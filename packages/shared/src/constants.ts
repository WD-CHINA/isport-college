/** 支持的语言 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]

/** 默认语言：简体中文 */
export const DEFAULT_LOCALE: LocaleCode = 'zh-CN'

/** 语言偏好 Cookie 名称，由 @nuxtjs/i18n 在服务端与客户端共同读写 */
export const LOCALE_COOKIE_NAME = 'ic_locale'

/**
 * URL 语言短码 → 数据语言码映射。
 * `apps/portal/nuxt.config.ts` 的 `i18n.locales[].code` 必须与此处的键保持一致；
 * 路由前缀剥离、语言化路由规则生成都以此为准，禁止在业务代码里硬编码 `/en`。
 */
export const LOCALE_URL_CODES = { zh: 'zh-CN', en: 'en-US' } as const

export type LocaleUrlCode = keyof typeof LOCALE_URL_CODES

/**
 * 需要从路径中剥离的 URL 语言前缀（不含默认语言）。
 * i18n 使用 `prefix_except_default` 策略，默认语言不产生前缀。
 */
export const LOCALE_URL_PREFIXES = ['en'] as const satisfies readonly LocaleUrlCode[]

/** 登录会话 Cookie 名称与有效期（秒，默认 7 天） */
export const AUTH_COOKIE_NAME = 'ic_auth'
export const AUTH_SESSION_TTL = 60 * 60 * 24 * 7

/**
 * 路由语言码 → 数据语言码映射。
 * URL 前缀使用短码（/en），业务数据与语言包使用完整码（en-US）。
 */
export function resolveDataLocale(code: string): LocaleCode {
  return code.startsWith('en') ? 'en-US' : 'zh-CN'
}
