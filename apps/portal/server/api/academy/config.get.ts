export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  setHeader(event, 'Cache-Control', 'no-store')
  return { dataSource: config.dataSource, productPhase: config.productPhase }
})
