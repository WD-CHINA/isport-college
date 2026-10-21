import type { WebContentDetail } from '@isport/shared'
import { richTextToPlainText } from '@isport/rich-text'

export function plainDescription(value: string): string {
  return richTextToPlainText(value).replace(/\s+/g, ' ').trim().slice(0, 160)
}

/** 缺少正文时只组合已有真实字段，不补造适用学段、教学用途或使用说明。 */
export function contentDescription(content: WebContentDetail, level = ''): string {
  return (
    plainDescription(content.summary || content.description || content.htmlBody) ||
    [
      ...new Set(
        [
          content.title,
          content.categoryName,
          level || content.levelName,
          content.publisherName || content.authorName,
        ].filter(Boolean),
      ),
    ]
      .join(' · ')
      .slice(0, 160)
  )
}
