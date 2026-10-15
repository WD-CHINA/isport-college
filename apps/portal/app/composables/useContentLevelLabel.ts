import type { WebContentCard } from '@isport/shared'

/** 首页与内容卡片共用的适用水平标签，不用内容分类推断水平。 */
export function useContentLevelLabel() {
  const { t, locale } = useI18n()
  const marks = ['一', '二', '三', '四', '五']

  return (content: Pick<WebContentCard, 'levelName' | 'recommendedLevel'>) => {
    if (content.levelName) return content.levelName
    const level = content.recommendedLevel
    if (!level) return ''
    const mark = locale.value === 'zh' ? marks[level - 1] : String(level)
    return mark ? t('catalog.levelBadge', { level: mark }) : ''
  }
}
