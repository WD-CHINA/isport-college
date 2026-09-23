import type { AcademyUser, TeacherProfile } from '@isport/shared'

export function useTeacherProfile() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const { t } = useI18n()

  const initial = (): TeacherProfile => ({
    realName: auth.user?.teacher?.realName ?? '',
    province: auth.user?.teacher?.province ?? '',
    city: auth.user?.teacher?.city ?? '',
    district: auth.user?.teacher?.district ?? '',
    school: auth.user?.teacher?.school ?? '',
    teacherRole: auth.user?.teacher?.teacherRole ?? '',
    stage: auth.user?.teacher?.stage ?? '',
    subject: auth.user?.teacher?.subject ?? '',
  })

  const form = reactive<TeacherProfile>(initial())
  const saving = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const success = shallowRef(false)

  const isComplete = computed(() => Object.values(form).every((v: string) => v.trim() !== ''))

  // 检查积分奖励是否已发放（通过 batches 中 profile source 判断）
  const rewardAlreadyIssued = shallowRef(false)

  async function checkReward() {
    try {
      const account = await academy.call('points/account', {})
      rewardAlreadyIssued.value = account.batches.some(b => b.source === 'profile')
    } catch {
      // 积分接口不可用时忽略（例如 P0 模式）
    }
  }

  async function save() {
    if (!isComplete.value) {
      error.value = t('creation.teacher.required')
      return
    }
    saving.value = true
    error.value = null
    success.value = false
    try {
      const user: AcademyUser = await academy.call('account/teacher', { ...form })
      auth.updateUser(user)
      success.value = true
      void checkReward()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      saving.value = false
    }
  }

  void checkReward()

  return { form, saving, error, success, isComplete, rewardAlreadyIssued, save }
}
