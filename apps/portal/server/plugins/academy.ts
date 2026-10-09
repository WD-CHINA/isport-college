export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  if (!config.public.apiBase) throw new Error('必须配置 NUXT_PUBLIC_API_BASE')
})
