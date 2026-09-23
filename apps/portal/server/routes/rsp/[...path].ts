export default defineEventHandler(() => {
  throw createError({ statusCode: 503, message: '旧资源接口已隔离，请使用学苑业务接口' })
})
