import dayjs from 'dayjs'
import { resolveDataLocale } from '@isport/shared'
import { dayjsLocaleMap } from '@isport/i18n'

/**
 * 客户端同步 dayjs 全局 Locale（供 antdv-next DatePicker 等内部组件使用）。
 * SSR 渲染路径使用 utils/date.ts 的实例级 locale，避免跨请求共享可变状态。
 */
export default defineNuxtPlugin(() => {
  const { $i18n } = useNuxtApp()

  watch(
    $i18n.locale,
    code => {
      dayjs.locale(dayjsLocaleMap[resolveDataLocale(code)] ?? 'zh-cn')
    },
    { immediate: true },
  )
})
