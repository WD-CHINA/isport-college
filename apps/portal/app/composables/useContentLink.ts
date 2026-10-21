import { isPublicHttpUrl, webContentPath, type WebContentCard, type WebNews } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

type LinkContent = WebContentCard | WebNews
const channels = { RESOURCE: 'resources', RESEARCH: 'research', SCHOOL: 'schools' } as const

/** 外链使用真实地址；缺少地址时进入有加载提示的站内页，不预先创建空白窗口。 */
export function useContentLink(getContent: () => LinkContent) {
  const apiUrl = useApiUrl()
  const localePath = useLocalePath()
  const isLink = computed(() => getContent().detailType === 'LINK')
  let nextOpenAt = 0
  const href = computed(() => {
    const content = getContent()
    if (content.detailType === 'LINK') {
      const url = apiUrl(content.jumpUrl)
      if (isPublicHttpUrl(url)) return url
      const channel = 'channel' in content ? channels[content.channel] : 'news'
      const id = 'channel' in content ? content.originId : content.id
      return localePath(`/outbound/${channel}/${id}`)
    }
    return localePath('channel' in content ? webContentPath(content) : `/news/${content.id}`)
  })

  function open(event: MouseEvent) {
    if (!isLink.value) return
    // 由浏览器直接打开 href；快速双击仍只创建一个新标签页。
    if (Date.now() < nextOpenAt) {
      event.preventDefault()
      return
    }
    nextOpenAt = Date.now() + 800
  }

  return { href, isLink, open }
}
