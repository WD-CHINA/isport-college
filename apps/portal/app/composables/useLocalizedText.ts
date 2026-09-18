import { resolveDataLocale } from '@isport/shared'
import type { LocalizedText } from '@isport/shared'

/** 按当前语言解析双语数据字段（路由短码经 resolveDataLocale 映射为数据语言码） */
export function useLocalizedText() {
  const { locale } = useI18n()

  return (text: LocalizedText): string => text[resolveDataLocale(locale.value)] ?? text['zh-CN']
}
