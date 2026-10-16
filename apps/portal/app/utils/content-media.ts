import type { MediaAsset, WebMediaItem } from '@isport/shared'

/** 详情页和列表弹窗采用同一媒体映射，不把文档类型判断放到 API 层。 */
export function toContentMedia(
  items: readonly WebMediaItem[],
  resolveUrl: (url: string) => string,
  coverUrl = '',
): MediaAsset[] {
  return items.map(item => {
    const documentKind = /\.pptx?($|\?)/i.test(item.fileUrl) ? 'ppt' : 'pdf'
    const kinds = {
      VIDEO: 'video',
      AUDIO: 'audio',
      IMAGE: 'image',
      DOCUMENT: documentKind,
    } as const
    return {
      kind: kinds[item.mediaType],
      url: resolveUrl(item.fileUrl),
      poster: item.mediaType === 'VIDEO' ? resolveUrl(item.coverUrl || coverUrl) : undefined,
      duration: item.durationSec ?? undefined,
      pageCount: item.pageCount ?? undefined,
    }
  })
}
