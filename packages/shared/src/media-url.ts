import { safeExternalUrl } from './academy'

/** 站内附件路径。远程地址另由 isPublicHttpUrl 判断。 */
export function isLocalMediaUrl(value: string): boolean {
  return (
    /^\/api\/academy\/files\/[a-zA-Z0-9-]+$/.test(value) ||
    /^\/media\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|mp4|webm|wav|mp3|ogg|pdf)$/i.test(value)
  )
}

const PUBLIC_HTTP_URL =
  /^https?:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\s\\]*)?$/i

/** 学苑前台返回的文件、封面和外链。允许 http，便于本机 8090 调试。 */
export function isPublicHttpUrl(value: string): boolean {
  return PUBLIC_HTTP_URL.test(value)
}

export function isContentAssetUrl(value: string): boolean {
  return isLocalMediaUrl(value) || isLocalImageUrl(value) || isPublicHttpUrl(value)
}

export function isContentImageUrl(value: string): boolean {
  return isLocalImageUrl(value) || isPublicHttpUrl(value)
}

export function isLocalImageUrl(value: string): boolean {
  return (
    /^\/api\/academy\/files\/[a-zA-Z0-9-]+$/.test(value) ||
    /^\/media\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)$/i.test(value)
  )
}

export function safeRichTextHref(value: string): string | undefined {
  const href = value.trim()
  if (
    !href ||
    /[\s\\]/.test(href) ||
    [...href].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  )
    return undefined
  if (safeExternalUrl(href)) return href
  if (/^#[a-zA-Z0-9_-]+$/.test(href)) return href
  if (/^\/(?!\/)[a-zA-Z0-9/_?=&.%#-]*$/.test(href) && !/%(?:2f|5b|5c|00|0a|0d)/i.test(href))
    return href
  return undefined
}
