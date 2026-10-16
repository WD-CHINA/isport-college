/** 把学苑返回的相对资源地址补成可访问的绝对地址。展示层使用。 */
export function resolveApiUrl(value: string | undefined, baseURL: string): string {
  const raw = (value ?? '').trim()
  if (!raw.startsWith('/') || !/^https?:\/\//i.test(baseURL)) return raw
  const base = new URL(baseURL)
  const prefix = base.pathname.replace(/\/$/, '')
  const asset = new URL(raw, base.origin)
  base.pathname = `${prefix}${asset.pathname}`
  base.search = asset.search
  base.hash = asset.hash
  return base.href
}

export function useApiUrl() {
  const baseURL = useRuntimeConfig().public.apiBase
  return (value?: string) => resolveApiUrl(value, baseURL)
}
