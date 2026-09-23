export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  if (!['mock', 'http'].includes(config.dataSource))
    throw new Error('dataSource 必须为 mock 或 http')
  if (!['p0', 'p1'].includes(config.productPhase)) throw new Error('productPhase 必须为 p0 或 p1')
  if (config.dataSource === 'mock' && config.public.siteEnv === 'production')
    throw new Error('生产环境禁止启用 Mock 数据源')
  if (
    config.mock.controlsEnabled &&
    (config.dataSource !== 'mock' ||
      config.public.siteEnv === 'production' ||
      !config.mock.controlKey)
  )
    throw new Error('Mock 控制接口仅允许在配置控制凭据的非生产 Mock 环境启用')
})
