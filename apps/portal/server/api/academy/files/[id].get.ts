import type { UploadedFile } from '@isport/shared'
import { currentUser, type MockContext } from '@isport/api-client/mock'
import { academyRequest, throwAcademyError } from '../../../utils/mock/request'
import { getMockStore } from '../../../utils/mock/storage'
import { readFileBytes } from '../../../utils/mock/file-store'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id || !/^[a-zA-Z0-9-]{1,64}$/.test(id))
      throw createError({ statusCode: 400, message: '无效的文件 ID' })

    const { config, namespace, options } = academyRequest(event)

    // 通过事务检查访问权限（不修改状态）
    const file = await getMockStore(config.mock.storageDir).transaction(
      namespace,
      (state): UploadedFile => {
        const ctx: MockContext = { ...options, state, now: state.clock ?? options.now }
        const record = state.files.find(f => f.id === id)
        if (!record) throw createError({ statusCode: 404, message: '文件不存在' })

        const user = currentUser(ctx, false)

        // 作者本人可访问
        if (user?.id === record.userId) return record

        // 审核员 / 管理员可访问
        if (user && (user.roles.includes('reviewer') || user.roles.includes('admin'))) return record

        // 被已发布内容引用的文件公开可访问
        const isPublic = state.contents.some(c => c.status === 'published' && c.media.fileId === id)
        if (isPublic) return record

        throw createError({ statusCode: 403, message: '没有访问权限' })
      },
    )

    const bytes = await readFileBytes(config.mock.storageDir, id)
    if (!bytes) throw createError({ statusCode: 404, message: '文件不存在' })

    setHeader(event, 'Content-Type', file.mime)
    setHeader(event, 'Content-Length', bytes.length)
    // 已发布内容文件允许 CDN 缓存；其他禁止缓存
    setHeader(event, 'Cache-Control', 'private, no-store')
    return bytes
  } catch (error) {
    throwAcademyError(error)
  }
})
