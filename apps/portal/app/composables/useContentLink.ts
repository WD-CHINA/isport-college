import { isPublicHttpUrl, webContentPath, type WebContentCard, type WebNews } from '@isport/shared'
import { useAcademy } from '~/composables/useAcademy'
import { useApiUrl } from '~/utils/api-url'

type LinkContent = WebContentCard | WebNews

/** LINK 直接打开外部页面；卡片未提供地址时，在新窗口中等待详情地址。 */
export function useContentLink(getContent: () => LinkContent, onError: () => void) {
  const academy = useAcademy()
  const apiUrl = useApiUrl()
  const localePath = useLocalePath()
  const isLink = computed(() => getContent().detailType === 'LINK')
  function externalUrl(content: LinkContent) {
    const url = apiUrl(content.jumpUrl)
    return content.detailType === 'LINK' && isPublicHttpUrl(url) ? url : ''
  }
  const href = computed(() => {
    const content = getContent()
    if (content.detailType === 'LINK') return externalUrl(content) || '#'
    return localePath('channel' in content ? webContentPath(content) : `/news/${content.id}`)
  })

  async function open(event: MouseEvent) {
    const content = getContent()
    if (content.detailType !== 'LINK') return
    event.preventDefault()
    const url = externalUrl(content)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    // 在点击事件中同步创建窗口，避免等待接口后被浏览器当作弹窗拦截。
    const popup = window.open('', '_blank')
    if (!popup) {
      onError()
      return
    }
    popup.opener = null
    try {
      const signal = AbortSignal.timeout(10_000)
      const detail =
        'channel' in content
          ? await academy.content(content.channel, content.originId, signal)
          : await academy.newsDetail(content.id, signal)
      const target = externalUrl(detail)
      if (!target) throw new Error('External link unavailable')
      if (!popup.closed) popup.location.replace(target)
    } catch {
      popup.close()
      onError()
    }
  }

  return { href, isLink, open }
}
