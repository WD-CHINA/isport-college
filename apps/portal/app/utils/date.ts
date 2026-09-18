import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { resolveDataLocale } from '@isport/shared'
import { dayjsLocaleMap } from '@isport/i18n'

dayjs.extend(localizedFormat)

/**
 * 按当前语言与浏览器时区格式化日期。
 * 日期数据统一以 ISO 8601 传递，展示时使用实例级 locale（SSR 安全）。
 * locale 参数支持路由短码（zh/en）与完整码（zh-CN/en-US）。
 */
export function formatDate(iso: string, locale: string, format = 'LL'): string {
  return dayjs(iso).locale(dayjsLocaleMap[resolveDataLocale(locale)]).format(format)
}
