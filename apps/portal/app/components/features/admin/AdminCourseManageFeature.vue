<script setup lang="ts">
import type { CourseListQuery, CoursePayload } from '@isport/api-client'
import { AdminPageHeader } from '@isport/ui-admin'
import { UiEmptyState } from '@isport/ui-core'
import type { Course, CourseDetail } from '@isport/shared'
import { App, useBreakpoint } from 'antdv-next'

const { t } = useI18n()
const localized = useLocalizedText()
const { modal } = App.useApp()
const { $courseRepository } = useNuxtApp()

const screens = useBreakpoint()
const isDesktop = computed(() => screens.value?.lg ?? false)

const query = shallowRef<CourseListQuery>({ page: 1, pageSize: 10 })

const { data, status, refresh } = await useCourseList({
  key: 'admin-course-list',
  query: () => query.value,
})

const courses = computed(() => data.value?.list ?? [])
const total = computed(() => data.value?.total ?? 0)
const pageSize = computed(() => data.value?.pageSize ?? 10)
const loading = computed(() => status.value === 'pending')

const page = computed({
  get: () => query.value.page ?? 1,
  set: (value: number) => {
    query.value = { ...query.value, page: value }
  },
})

const { saving, createCourse, updateCourse, removeCourse } = useAdminCourses(() => refresh())

const modalOpen = shallowRef(false)
const editing = shallowRef<CourseDetail | null>(null)

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

async function openEdit(course: Course) {
  // 列表项不含 description/schedule，编辑前取完整详情
  editing.value = await $courseRepository.getById(course.id)
  modalOpen.value = true
}

async function onSubmit(payload: CoursePayload) {
  const ok = editing.value
    ? await updateCourse(editing.value.id, payload)
    : await createCourse(payload)
  if (ok) modalOpen.value = false
}

function onRemove(course: Course) {
  modal.confirm({
    title: t('admin.deleteCourse'),
    content: t('admin.deleteConfirm', { name: localized(course.name) }),
    onOk: () => removeCourse(course.id),
  })
}
</script>

<template>
  <section class="admin-course-manage">
    <AdminPageHeader :title="t('nav.courseManage')">
      <template #extra>
        <a-button type="primary" @click="openCreate">
          {{ t('admin.createCourse') }}
        </a-button>
      </template>
    </AdminPageHeader>

    <AdminCourseTable
      v-if="isDesktop"
      :courses="courses"
      :loading="loading"
      @edit="openEdit"
      @remove="onRemove"
    />
    <AdminCourseCardList
      v-else
      :courses="courses"
      :loading="loading"
      @edit="openEdit"
      @remove="onRemove"
    />

    <UiEmptyState v-if="!loading && courses.length === 0" :title="t('common.empty')" />

    <CoursePagination
      v-if="!loading && courses.length > 0"
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
    />

    <AdminCourseFormModal
      v-model:open="modalOpen"
      :course="editing"
      :saving="saving"
      @submit="onSubmit"
    />
  </section>
</template>
