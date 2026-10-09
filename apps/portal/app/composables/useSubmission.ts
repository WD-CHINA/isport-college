import { isApiError } from '~/api/errors'
import type { SubmissionKind, Taxonomy, WorkFields } from '@isport/shared'

function emptyFields(kind: SubmissionKind): WorkFields {
  const mode: WorkFields['mode'] =
    kind === 'practice' ? 'article' : kind === 'micro' || kind === 'lesson' ? 'article' : 'file'
  return {
    kind,
    title: '',
    summary: '',
    cover: '',
    category: '',
    tags: [],
    level: undefined,
    stage: '',
    mode,
    fileId: undefined,
    body: '',
    url: '',
    copyright: false,
    privacy: false,
  }
}

/** 投稿读写不在学苑前台接口中；保留表单状态供页面展示。 */
export function useSubmission(existingId?: string) {
  const { t, locale } = useI18n()
  const { createSlot, upload: uploadFile, remove: removeFile } = useFileUpload()
  const kind = shallowRef<SubmissionKind>('demonstration')
  const fields = reactive<WorkFields>(emptyFields('demonstration'))
  const workId = shallowRef<string | undefined>(existingId)
  const saving = shallowRef(false)
  const submitting = shallowRef(false)
  const formError = shallowRef<string | null>(null)
  const successMsg = shallowRef<string | null>(null)
  const isDirty = shallowRef(false)
  const coverSlot = createSlot()
  const fileSlot = createSlot()
  const taxonomyReq = useAsyncData<Taxonomy[]>(
    () => `academy:taxonomies:${locale.value}`,
    () => academyUnavailable('content/taxonomies', {}),
  )
  const taxonomies = computed(() =>
    (taxonomyReq.data.value ?? []).filter(item =>
      kind.value === 'practice' ? item.channel === 'research' : true,
    ),
  )
  const uploadPurpose = computed(() =>
    kind.value === 'courseware' ? ('courseware' as const) : ('video' as const),
  )

  function setKind(next: SubmissionKind) {
    kind.value = next
    Object.assign(fields, emptyFields(next))
    removeFile(coverSlot)
    removeFile(fileSlot)
    isDirty.value = true
  }

  async function uploadCover(file: File) {
    await uploadFile(coverSlot, 'image', file)
    if (coverSlot.record) fields.cover = coverSlot.record.id
    isDirty.value = true
  }

  async function uploadContentFile(file: File) {
    await uploadFile(fileSlot, uploadPurpose.value, file)
    if (fileSlot.record) fields.fileId = fileSlot.record.id
    isDirty.value = true
  }

  async function rejectUnavailable() {
    formError.value = null
    successMsg.value = null
    try {
      await academyUnavailable()
    } catch (err: unknown) {
      formError.value = isApiError(err) ? err.message : String(err)
    }
  }

  async function saveDraft() {
    saving.value = true
    try {
      await rejectUnavailable()
      return null
    } finally {
      saving.value = false
    }
  }

  async function submit() {
    submitting.value = true
    try {
      await rejectUnavailable()
    } finally {
      submitting.value = false
    }
  }

  if (existingId) void rejectUnavailable()

  onBeforeRouteLeave(() => {
    if (isDirty.value) return window.confirm(t('creation.submission.unsavedWarning'))
    return true
  })

  return {
    kind,
    fields,
    taxonomies,
    coverSlot,
    fileSlot,
    saving,
    submitting,
    formError,
    successMsg,
    workId,
    setKind,
    markDirty: () => {
      isDirty.value = true
    },
    uploadCover,
    removeCover: () => {
      removeFile(coverSlot)
      fields.cover = ''
      isDirty.value = true
    },
    uploadContentFile,
    removeContentFile: () => {
      removeFile(fileSlot)
      fields.fileId = undefined
      isDirty.value = true
    },
    saveDraft,
    submit,
    loadWork: rejectUnavailable,
  }
}
