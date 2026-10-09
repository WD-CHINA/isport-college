import type { TeacherProfile } from '@isport/shared'

export function useTeacherProfile() {
  const { t } = useI18n()
  const form = reactive<TeacherProfile>({
    realName: '',
    province: '',
    city: '',
    district: '',
    school: '',
    teacherRole: '',
    stage: '',
    subject: '',
  })
  const saving = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const success = shallowRef(false)
  const isComplete = computed(() => Object.values(form).every(value => value.trim() !== ''))
  const rewardAlreadyIssued = shallowRef(false)

  async function save() {
    if (!isComplete.value) {
      error.value = t('creation.teacher.required')
      return
    }
    saving.value = true
    error.value = null
    success.value = false
    try {
      await academyUnavailable()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      saving.value = false
    }
  }

  return { form, saving, error, success, isComplete, rewardAlreadyIssued, save }
}
