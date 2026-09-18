import { isApiError } from '@isport/api-client'
import { App } from 'antdv-next'

/** 课程报名：操作门禁 + Repository 调用 + 反馈消息 */
export function useCourseEnrollment(courseId: MaybeRefOrGetter<string>) {
  const { $courseRepository } = useNuxtApp()
  const { requireAuth } = useAuthGate()
  const { message } = App.useApp()
  const { t } = useI18n()

  const enrolling = shallowRef(false)
  const enrolled = shallowRef(false)

  async function enroll(): Promise<void> {
    await requireAuth({
      reason: 'enroll',
      onSuccess: async () => {
        enrolling.value = true
        try {
          await $courseRepository.enroll(toValue(courseId))
          enrolled.value = true
          message.success(t('course.enrollSuccess'))
        } catch (error) {
          if (isApiError(error) && error.code === 'VALIDATION_FAILED') {
            message.warning(t('course.enrollFull'))
          } else {
            message.error(t('error.serverTitle'))
          }
        } finally {
          enrolling.value = false
        }
      },
    })
  }

  return {
    enrolling: readonly(enrolling),
    enrolled: readonly(enrolled),
    enroll,
  }
}
