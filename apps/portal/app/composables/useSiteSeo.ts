import { isAdminRoutePath, isPrivateRoutePath } from '@isport/shared'
import { canonicalUrl, isSearchPage } from '~/utils/seo'

/** 全站标题、标准网址与收录策略；页面只负责自己的标题和描述。 */
export function useSiteSeo() {
  const route = useRoute()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const robots = computed(() => {
    if (
      config.public.siteEnv !== 'production' ||
      isAdminRoutePath(route.path) ||
      isPrivateRoutePath(route.path)
    )
      return 'noindex, nofollow, noarchive'
    return isSearchPage(route.path, route.query) ? 'noindex, follow' : undefined
  })
  useSeoMeta({
    titleTemplate: title => {
      const brand = t('seo.siteName')
      return !title ? brand : title.includes(brand) ? title : `${title} - ${brand}`
    },
    robots: () => robots.value,
    ogUrl: () => canonicalUrl(route.path, route.query),
  })
  useHead(() => ({
    link: [{ key: 'canonical', rel: 'canonical', href: canonicalUrl(route.path, route.query) }],
  }))
}
