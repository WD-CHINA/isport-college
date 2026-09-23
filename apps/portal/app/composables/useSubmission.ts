import type { SubmissionKind, Taxonomy, Work, WorkFields } from '@isport/shared'
import { isApiError } from '@isport/api-client'

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

export function useSubmission(existingId?: string) {
  const academy = useAcademy()
  const { t } = useI18n()
  const router = useRouter()
  const localePath = useLocalePath()
  const { createSlot, upload: uploadFile, remove: removeFile } = useFileUpload()

  const kind = shallowRef<SubmissionKind>('demonstration')
  const fields = reactive<WorkFields>(emptyFields('demonstration'))
  const workId = shallowRef<string | undefined>(existingId)
  const version = shallowRef(1)
  const saving = shallowRef(false)
  const submitting = shallowRef(false)
  const formError = shallowRef<string | null>(null)
  const successMsg = shallowRef<string | null>(null)
  const isDirty = shallowRef(false)
  const coverSlot = createSlot()
  const fileSlot = createSlot()

  const taxonomyReq = useAsyncData('academy:taxonomies', () =>
    academy.call('content/taxonomies', {}),
  )
  const taxonomies = computed<Taxonomy[]>(() =>
    (taxonomyReq.data.value ?? []).filter(tx =>
      kind.value === 'practice' ? tx.channel === 'research' : true,
    ),
  )

  function setKind(k: SubmissionKind) {
    kind.value = k
    Object.assign(fields, emptyFields(k))
    removeFile(coverSlot)
    removeFile(fileSlot)
    isDirty.value = true
  }

  function markDirty() {
    isDirty.value = true
  }

  // 根据投稿类型决定文件上传用途
  const uploadPurpose = computed(() => {
    if (kind.value === 'courseware') return 'courseware' as const
    return 'video' as const
  })

  async function uploadCover(file: File) {
    await uploadFile(coverSlot, 'image', file)
    if (coverSlot.record) fields.cover = `/api/academy/files/${coverSlot.record.id}`
    markDirty()
  }

  async function uploadContentFile(file: File) {
    await uploadFile(fileSlot, uploadPurpose.value, file)
    if (fileSlot.record) fields.fileId = fileSlot.record.id
    markDirty()
  }

  function removeContentFile() {
    removeFile(fileSlot)
    fields.fileId = undefined
    markDirty()
  }

  function validate(): string | null {
    if (!fields.title.trim()) return t('creation.submission.formTitle')
    if (!fields.cover) return t('creation.submission.formCover')
    if (!fields.category) return t('creation.submission.formCategory')
    if ((kind.value === 'demonstration' || kind.value === 'courseware') && !fields.level)
      return t('creation.submission.formLevel')
    if (!fields.copyright || !fields.privacy) return t('creation.submission.copyright')
    if (fields.mode === 'file' && !fields.fileId) return t('creation.submission.modeFile')
    if (fields.mode === 'article' && !fields.body.replace(/<[^>]*>/g, '').trim())
      return t('creation.submission.modeArticle')
    if (fields.mode === 'link' && !fields.url.trim()) return t('creation.submission.modeLink')
    return null
  }

  async function saveDraft() {
    saving.value = true
    formError.value = null
    successMsg.value = null
    try {
      const payload: Record<string, unknown> = { ...fields }
      if (workId.value) {
        payload.id = workId.value
        payload.version = version.value
      }
      const work: Work = await academy.call('work/save', payload as never)
      workId.value = work.id
      version.value = work.version
      successMsg.value = t('creation.submission.draftSaved')
      isDirty.value = false
      return work
    } catch (err: unknown) {
      formError.value = isApiError(err) ? err.message : String(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function submit() {
    const err = validate()
    if (err) {
      formError.value = err
      return
    }
    submitting.value = true
    formError.value = null
    try {
      // 先保存草稿（若无 ID）
      if (!workId.value) {
        const saved = await saveDraft()
        if (!saved) return
      } else {
        // 更新已有草稿
        const payload: Record<string, unknown> = {
          ...fields,
          id: workId.value,
          version: version.value,
        }
        const updated: Work = await academy.call('work/save', payload as never)
        version.value = updated.version
      }
      // 提交审核
      const requestId = crypto.randomUUID()
      await academy.call('work/submit', {
        id: workId.value!,
        version: version.value,
        requestId,
      })
      successMsg.value = t('creation.submission.submitted')
      isDirty.value = false
      setTimeout(() => void router.push(localePath('/admin/works')), 1500)
    } catch (err: unknown) {
      formError.value = isApiError(err) ? err.message : String(err)
    } finally {
      submitting.value = false
    }
  }

  // 加载已有作品（编辑模式）
  async function loadWork(id: string) {
    try {
      const detail = await academy.call('work/detail', { id })
      Object.assign(fields, {
        kind: detail.work.kind,
        title: detail.work.title,
        summary: detail.work.summary,
        cover: detail.work.cover,
        category: detail.work.category,
        tags: detail.work.tags,
        level: detail.work.level,
        stage: detail.work.stage,
        mode: detail.work.mode,
        fileId: detail.work.fileId,
        body: detail.work.body,
        url: detail.work.url,
        copyright: detail.work.copyright,
        privacy: detail.work.privacy,
      })
      kind.value = detail.work.kind
      workId.value = detail.work.id
      version.value = detail.work.version
      // 还原 cover slot
      if (detail.work.cover && detail.files.length) {
        const coverFile = detail.files.find(f => f.kind === 'image')
        if (coverFile) {
          coverSlot.record = coverFile
          coverSlot.progress = 100
        }
      }
      // 还原 content file slot
      if (detail.work.fileId) {
        const cf = detail.files.find(f => f.id === detail.work.fileId)
        if (cf) {
          fileSlot.record = cf
          fileSlot.progress = 100
        }
      }
    } catch (err: unknown) {
      formError.value = isApiError(err) ? err.message : String(err)
    }
  }

  if (existingId) void loadWork(existingId)

  // 离开前提示未保存
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
    markDirty,
    uploadCover,
    uploadContentFile,
    removeContentFile,
    saveDraft,
    submit,
    loadWork,
  }
}
