import type { LocaleCode } from '@isport/shared'

import type zhCN from './locales/zh-CN'

export { default as zhCN } from './locales/zh-CN'
export { default as enUS } from './locales/en-US'

/** 将 as const 语言包中的字面量类型放宽为 string，保留键结构约束 */
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}

/** 以中文语言包为 Schema 基准，英文包必须与其键结构一致 */
export type MessageSchema = DeepString<typeof zhCN>

/** Locale → dayjs 语言名映射，切换语言时同步 dayjs */
export const dayjsLocaleMap: Record<LocaleCode, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
}
