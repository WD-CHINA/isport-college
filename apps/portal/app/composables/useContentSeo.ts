import type { ContentChannel, WebContentDetail } from '@isport/shared'
import { canonicalUrl, jsonLd } from '~/utils/seo'
import { contentDescription } from '~/utils/content-seo'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'
import { useApiUrl } from '~/utils/api-url'

/** 内容元信息和结构化数据来自同一份已渲染详情。 */
export function useContentSeo(
  getContent: () => WebContentDetail | undefined,
  channel: ContentChannel,
) {
  const { t } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()
  const getLevel = useContentLevelLabel()
  const apiUrl = useApiUrl()
  const description = computed(() => {
    const content = getContent()
    return content ? contentDescription(content, getLevel(content)) : ''
  })
  const absoluteAsset = (value: string) => {
    const resolved = apiUrl(value)
    return /^https?:\/\//i.test(resolved)
      ? resolved
      : resolved.startsWith('/')
        ? new URL(resolved, canonicalUrl('/')).href
        : undefined
  }
  useSeoMeta({
    title: () => getContent()?.title || t('detail.notFound'),
    description: () => description.value,
    ogTitle: () => getContent()?.title,
    ogDescription: () => description.value,
    ogImage: () => absoluteAsset(getContent()?.coverUrl ?? ''),
    ogType: () => (getContent()?.detailType === 'ARTICLE' ? 'article' : 'website'),
  })
  useHead(() => {
    const content = getContent()
    if (!content) return { script: [] }
    const url = canonicalUrl(route.path)
    const channelPath = { resource: '/resources', research: '/research', school: '/schools' }[
      channel
    ]
    const image = absoluteAsset(content.coverUrl)
    const datePublished =
      content.publishedAt && Number.isFinite(new Date(content.publishedAt).getTime())
        ? new Date(content.publishedAt).toISOString()
        : undefined
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('nav.home'),
            item: canonicalUrl(localePath('/')),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t(`catalog.channels.${channel}`),
            item: canonicalUrl(localePath(channelPath)),
          },
          { '@type': 'ListItem', position: 3, name: content.title, item: url },
        ],
      },
    ]
    if (content.detailType === 'ARTICLE' && content.htmlBody) {
      graph.push({
        '@type': 'Article',
        headline: content.title,
        description: description.value,
        mainEntityOfPage: url,
        image,
        datePublished,
        ...(content.authorName ? { author: { '@type': 'Person', name: content.authorName } } : {}),
        ...(content.publisherName
          ? { publisher: { '@type': 'Organization', name: content.publisherName } }
          : {}),
      })
    }
    const video = content.mediaList.find(item => item.mediaType === 'VIDEO')
    const thumbnail = absoluteAsset(video?.coverUrl || content.coverUrl)
    const contentUrl = absoluteAsset(video?.fileUrl ?? '')
    if (video && thumbnail && datePublished && contentUrl) {
      graph.push({
        '@type': 'VideoObject',
        name: content.title,
        description: description.value,
        thumbnailUrl: thumbnail,
        uploadDate: datePublished,
        contentUrl,
        ...(video.durationSec && video.durationSec > 0
          ? { duration: `PT${video.durationSec}S` }
          : {}),
      })
    }
    return {
      script: [
        {
          key: 'content-schema',
          type: 'application/ld+json',
          innerHTML: jsonLd({ '@context': 'https://schema.org', '@graph': graph }),
        },
      ],
    }
  })
}
