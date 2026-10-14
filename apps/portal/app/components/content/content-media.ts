import type { WebDetailType } from '@isport/shared'

const icons: Record<WebDetailType, string> = {
  VIDEO: 'ee3bb.svg',
  AUDIO: '5b8fd.svg',
  DOCUMENT: '4f72c.svg',
  IMAGE: 'e2df2.svg',
  LINK: '4f72c.svg',
  ARTICLE: '4f72c.svg',
}

export function contentMediaIcon(type: WebDetailType) {
  return `/home/figma/${icons[type]}`
}
