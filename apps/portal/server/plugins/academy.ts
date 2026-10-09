export default defineNitroPlugin(() => {
  const base = useRuntimeConfig().public.apiBase
  if (!base || (base.startsWith('/') && !base.startsWith('//'))) return
  try {
    const target = new URL(base)
    if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password)
      throw new Error('Invalid API base')
  } catch {
    throw new Error(
      'NUXT_PUBLIC_API_BASE 必须是 HTTP/HTTPS 根地址，或留空改由开发服务器/Nginx 转发',
    )
  }
})
