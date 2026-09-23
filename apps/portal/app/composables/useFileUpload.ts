import type { UploadedFile } from '@isport/shared'
import { isApiError } from '@isport/api-client'

export type UploadPurpose = 'video' | 'courseware' | 'image'

export interface UploadState {
  file: File | null
  record: UploadedFile | null
  progress: number
  uploading: boolean
  error: string | null
}

/**
 * 管理一个文件的上传状态。purpose 决定服务端允许的类型与大小。
 * 上传通过 academyHttp（ofetch）发送 multipart/form-data。
 */
export function useFileUpload() {
  const nuxt = useNuxtApp()
  const { t } = useI18n()

  function createSlot() {
    return reactive<UploadState>({
      file: null,
      record: null,
      progress: 0,
      uploading: false,
      error: null,
    })
  }

  async function upload(slot: UploadState, purpose: UploadPurpose, file: File) {
    slot.file = file
    slot.record = null
    slot.error = null
    slot.progress = 0
    slot.uploading = true

    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', purpose)

    try {
      const record = await nuxt.$academyHttp<UploadedFile>('/api/academy/files', {
        method: 'POST',
        body: formData,
        timeout: 0, // 大文件不超时
        // ofetch 在有 body 时不自动设置 Content-Type，让浏览器添加 boundary
        headers: {},
      })
      slot.record = record
      slot.progress = 100
    } catch (err: unknown) {
      if (isApiError(err)) {
        slot.error = err.message
      } else {
        slot.error = t('creation.file.uploadFailed')
      }
      slot.file = null
    } finally {
      slot.uploading = false
    }
  }

  function remove(slot: UploadState) {
    slot.file = null
    slot.record = null
    slot.error = null
    slot.progress = 0
  }

  return { createSlot, upload, remove }
}
