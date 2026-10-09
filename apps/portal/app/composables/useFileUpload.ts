import type { UploadedFile } from '@isport/shared'

export type UploadPurpose = 'video' | 'courseware' | 'image'

export interface UploadState {
  file: File | null
  record: UploadedFile | null
  progress: number
  uploading: boolean
  error: string | null
}

/** 文件上传不在学苑前台接口中。 */
export function useFileUpload() {
  function createSlot() {
    return reactive<UploadState>({
      file: null,
      record: null,
      progress: 0,
      uploading: false,
      error: null,
    })
  }

  async function upload(slot: UploadState, _purpose: UploadPurpose, file: File) {
    slot.file = file
    slot.record = null
    slot.progress = 0
    slot.uploading = false
    try {
      await academyUnavailable()
    } catch (err: unknown) {
      slot.error = err instanceof Error ? err.message : String(err)
      slot.file = null
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
