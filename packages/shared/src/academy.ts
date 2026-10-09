export type ContentChannel = 'resource' | 'research' | 'school'

export type MediaKind = 'video' | 'audio' | 'image' | 'pdf' | 'ppt' | 'article' | 'link'

export type InteractionKind = 'like' | 'favorite'

export interface MediaAsset {
  kind: MediaKind
  url: string
  fileId?: string
  filename?: string
  mime?: string
  size?: number
  duration?: number
  pageCount?: number
}

export interface ContentStats {
  views: number
  likes: number
  favorites: number
  liked: boolean
  favorited: boolean
}

export const CONTENT_CHANNELS: readonly ContentChannel[] = ['resource', 'research', 'school']
export const MEDIA_KINDS: readonly MediaKind[] = [
  'video',
  'audio',
  'image',
  'pdf',
  'ppt',
  'article',
  'link',
]

export const AVATAR_IDS = [
  'ball',
  'runner',
  'swimmer',
  'cyclist',
  'racket',
  'star',
  'mountain',
  'sun',
] as const

export function normalizeNickname(value: string): string | null {
  const nickname = value.trim()
  return nickname === '' || /^[\u4e00-\u9fffA-Za-z0-9]{2,6}$/.test(nickname) ? nickname : null
}

/** 仅接受显式 HTTPS 地址；完整 URL 解析与可达性由适配层处理。 */
export function safeExternalUrl(value: string): boolean {
  return /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\s\\]*)?$/i.test(
    value,
  )
}
