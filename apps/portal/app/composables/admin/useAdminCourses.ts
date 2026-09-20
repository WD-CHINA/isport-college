import { App } from 'antdv-next'

import {
  createCourse as createCourseApi,
  deleteCourse,
  updateCourse as updateCourseApi,
  type CoursePayload,
} from '~/api/course'

/** 管理端课程增删改：统一消息反馈与列表刷新 */
export function useAdminCourses(refresh: () => Promise<void>) {
  const { message } = App.useApp()
  const { t } = useI18n()

  const saving = shallowRef(false)

  async function createCourse(payload: CoursePayload): Promise<boolean> {
    saving.value = true
    try {
      await createCourseApi(payload)
      message.success(t('admin.createSuccess'))
      await refresh()
      return true
    } catch {
      message.error(t('error.serverTitle'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateCourse(id: string, payload: CoursePayload): Promise<boolean> {
    saving.value = true
    try {
      await updateCourseApi(id, payload)
      message.success(t('admin.updateSuccess'))
      await refresh()
      return true
    } catch {
      message.error(t('error.serverTitle'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeCourse(id: string): Promise<void> {
    try {
      await deleteCourse(id)
      message.success(t('admin.deleteSuccess'))
      await refresh()
    } catch {
      message.error(t('error.serverTitle'))
    }
  }

  return {
    saving: readonly(saving),
    createCourse,
    updateCourse,
    removeCourse,
  }
}
