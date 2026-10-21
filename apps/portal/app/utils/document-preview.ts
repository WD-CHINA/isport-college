/** 文档预览服务默认地址；各环境 .env 可通过 NUXT_PUBLIC_DOCUMENT_PREVIEW_BASE 配置。 */
export const DEFAULT_DOCUMENT_PREVIEW_BASE =
  'https://academy.dream-sports.cn/viewer/?showHeader=0&showImport=0&showUrlImport=0&showToolbar=1&showErrors=0'

/** 将文件地址拼成预览服务 URL，并对文件地址做 encode。 */
export function toDocumentPreviewUrl(fileUrl: string, viewerBase: string): string {
  const absolute =
    /^https?:\/\//i.test(fileUrl) || !import.meta.client
      ? fileUrl
      : new URL(fileUrl, window.location.origin).href
  const base = viewerBase.trim() || DEFAULT_DOCUMENT_PREVIEW_BASE
  const joiner = base.includes('?') ? (base.endsWith('&') || base.endsWith('?') ? '' : '&') : '?'
  return `${base}${joiner}url=${encodeURIComponent(absolute)}`
}
