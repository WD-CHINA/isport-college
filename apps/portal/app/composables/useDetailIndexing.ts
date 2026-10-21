/** 错误页与仅提供外链的详情不参与收录，保留非生产环境策略。 */
export function useDetailIndexing(hasError: () => boolean) {
  const config = useRuntimeConfig()
  useSeoMeta({
    robots: () =>
      config.public.siteEnv !== 'production' || hasError()
        ? 'noindex, nofollow, noarchive'
        : undefined,
  })
}
