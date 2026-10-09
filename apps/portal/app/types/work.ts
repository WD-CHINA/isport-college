import type { ReviewRecord, UploadedFile, Work } from '@isport/shared'

/** 投稿详情。写接口不在学苑前台文档中，仅供管理端页面类型使用。 */
export interface WorkDetail {
  work: Work
  reviews: ReviewRecord[]
  files: UploadedFile[]
}
