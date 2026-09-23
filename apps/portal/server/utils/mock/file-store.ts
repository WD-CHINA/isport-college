import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { MOCK_RULES } from '@isport/api-client/mock'
import type { MediaKind } from '@isport/shared'

export type UploadPurpose = 'video' | 'courseware' | 'image'

const MIME_KIND: Record<string, MediaKind> = {
  'video/mp4': 'video',
  'video/webm': 'video',
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
}

const PURPOSE_MIMES: Record<UploadPurpose, string[]> = {
  video: ['video/mp4', 'video/webm'],
  courseware: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  image: ['image/jpeg', 'image/png', 'image/webp'],
}

const PURPOSE_MAX: Record<UploadPurpose, number> = {
  video: MOCK_RULES.uploadLimits.video,
  courseware: MOCK_RULES.uploadLimits.courseware,
  image: MOCK_RULES.uploadLimits.image,
}

export class FileValidationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
  }
}

function filesDir(storageDir: string): string {
  return join(resolve(storageDir || '.data/mock'), 'files')
}

export async function writeFileBytes(storageDir: string, id: string, bytes: Buffer): Promise<void> {
  const dir = filesDir(storageDir)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, id), bytes)
}

export async function readFileBytes(storageDir: string, id: string): Promise<Buffer | null> {
  try {
    return await readFile(join(filesDir(storageDir), id))
  } catch {
    return null
  }
}

/** 校验上传用途、MIME 类型和大小，返回对应的 MediaKind；失败抛出 FileValidationError。 */
export function validateUpload(purpose: string, mime: string, size: number): MediaKind {
  if (!purpose || !(purpose in PURPOSE_MIMES)) throw new FileValidationError('无效的上传用途', 400)
  const p = purpose as UploadPurpose
  if (!mime || !PURPOSE_MIMES[p].includes(mime))
    throw new FileValidationError(`不支持的文件格式：${mime || '未知'}`, 400)
  if (size > PURPOSE_MAX[p])
    throw new FileValidationError(
      `文件超出大小限制（最大 ${Math.floor(PURPOSE_MAX[p] / 1024 / 1024)} MB）`,
      400,
    )
  return MIME_KIND[mime]!
}
