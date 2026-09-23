import { randomUUID } from 'node:crypto'
import type { UploadedFile } from '@isport/shared'
import { requireUser, type MockContext } from '@isport/api-client/mock'
import { academyRequest, throwAcademyError } from '../../../utils/mock/request'
import { getMockStore } from '../../../utils/mock/storage'
import { FileValidationError, validateUpload, writeFileBytes } from '../../../utils/mock/file-store'

export default defineEventHandler(async event => {
  try {
    const { config, namespace, options } = academyRequest(event)
    const parts = await readMultipartFormData(event)
    const filePart = parts?.find(p => p.name === 'file')
    const purposePart = parts?.find(p => p.name === 'purpose')

    if (!filePart?.data?.length) throw new FileValidationError('请选择要上传的文件', 400)
    const purpose = purposePart?.data?.toString('utf8').trim() ?? ''
    const mime = filePart.type ?? ''
    const bytes = filePart.data

    // 校验类型与大小（抛出 FileValidationError）
    const kind = validateUpload(purpose, mime, bytes.length)

    const id = randomUUID()
    // 先写入磁盘（若事务失败，孤立文件无害）
    await writeFileBytes(config.mock.storageDir, id, bytes)

    // 在事务中验证用户并登记文件记录
    const record = await getMockStore(config.mock.storageDir).transaction(
      namespace,
      (state): UploadedFile => {
        const ctx: MockContext = { ...options, state, now: state.clock ?? options.now }
        const user = requireUser(ctx)
        const file: UploadedFile = {
          id,
          userId: user.id,
          name: filePart.filename ?? id,
          mime,
          size: bytes.length,
          kind,
          createdAt: ctx.now,
        }
        state.files.push(file)
        return file
      },
    )

    return { code: 200, data: record }
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw createError({ statusCode: error.statusCode, message: error.message })
    }
    throwAcademyError(error)
  }
})
