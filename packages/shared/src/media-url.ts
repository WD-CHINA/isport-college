import { safeExternalUrl } from './academy'

/** Mock 附件只允许本地受控端点，不接受任意远程追踪图片或主动内容。 */
export function isLocalMediaUrl(value: string): boolean {
  return (
    /^\/api\/academy\/files\/[a-zA-Z0-9-]+$/.test(value) ||
    /^\/media\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|mp4|webm|wav|mp3|ogg|pdf)$/i.test(value)
  )
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
