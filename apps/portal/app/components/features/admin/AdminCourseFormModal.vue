<script setup lang="ts">
import type { CoursePayload } from '@isport/api-client'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@isport/shared'
import type { CourseCategory, CourseDetail, CourseLevel } from '@isport/shared'
import {
  DatePicker as ADatePicker,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Select as ASelect,
  SelectOption as ASelectOption,
  Switch as ASwitch,
  TextArea as ATextarea,
} from 'antdv-next'

interface Props {
  /** 编辑中的课程；为空表示新建 */
  course?: CourseDetail | null
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
  saving: false,
})

const emit = defineEmits<{
  submit: [payload: CoursePayload]
}>()

const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()

interface FormState {
  nameZh: string
  nameEn: string
  category: CourseCategory | ''
  level: CourseLevel | ''
  coach: string
  durationMin: number | undefined
  capacity: number | undefined
  price: number | undefined
  startDate: string
  locationZh: string
  locationEn: string
  descZh: string
  descEn: string
  scheduleZh: string
  scheduleEn: string
  featured: boolean
}

type FormErrors = Partial<
  Record<
    | 'name'
    | 'category'
    | 'level'
    | 'coach'
    | 'durationMin'
    | 'capacity'
    | 'price'
    | 'startDate'
    | 'location'
    | 'desc',
    string
  >
>

const emptyForm = (): FormState => ({
  nameZh: '',
  nameEn: '',
  category: '',
  level: '',
  coach: '',
  durationMin: undefined,
  capacity: undefined,
  price: undefined,
  startDate: '',
  locationZh: '',
  locationEn: '',
  descZh: '',
  descEn: '',
  scheduleZh: '',
  scheduleEn: '',
  featured: false,
})

const form = reactive<FormState>(emptyForm())
const errors = reactive<FormErrors>({})

const title = computed(() => (props.course ? t('admin.editCourse') : t('admin.createCourse')))

watch(open, visible => {
  if (!visible) return
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors])
  const c = props.course
  Object.assign(
    form,
    emptyForm(),
    c
      ? {
          nameZh: c.name['zh-CN'],
          nameEn: c.name['en-US'],
          category: c.category,
          level: c.level,
          coach: c.coach,
          durationMin: c.durationMin,
          capacity: c.capacity,
          price: c.price,
          startDate: c.startDate.slice(0, 10),
          locationZh: c.location['zh-CN'],
          locationEn: c.location['en-US'],
          descZh: c.description['zh-CN'],
          descEn: c.description['en-US'],
          scheduleZh: c.schedule['zh-CN'],
          scheduleEn: c.schedule['en-US'],
          featured: c.featured,
        }
      : undefined,
  )
})

function validate(): boolean {
  errors.name = form.nameZh.trim() ? '' : t('admin.formNameRequired')
  errors.category = form.category ? '' : t('admin.formCategoryRequired')
  errors.level = form.level ? '' : t('admin.formLevelRequired')
  errors.coach = form.coach.trim() ? '' : t('admin.formCoachRequired')
  errors.durationMin =
    form.durationMin && form.durationMin > 0 ? '' : t('admin.formDurationRequired')
  errors.capacity = form.capacity && form.capacity > 0 ? '' : t('admin.formCapacityRequired')
  errors.price = form.price !== undefined && form.price >= 0 ? '' : t('admin.formPriceRequired')
  errors.startDate = form.startDate ? '' : t('admin.formStartDateRequired')
  errors.location = form.locationZh.trim() ? '' : t('admin.formLocationRequired')
  errors.desc = form.descZh.trim() ? '' : t('admin.formDescRequired')
  return Object.values(errors).every(msg => !msg)
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    name: { 'zh-CN': form.nameZh.trim(), 'en-US': form.nameEn.trim() || form.nameZh.trim() },
    category: form.category as CourseCategory,
    level: form.level as CourseLevel,
    coach: form.coach.trim(),
    durationMin: form.durationMin ?? 0,
    capacity: form.capacity ?? 0,
    price: form.price ?? 0,
    startDate: form.startDate,
    location: {
      'zh-CN': form.locationZh.trim(),
      'en-US': form.locationEn.trim() || form.locationZh.trim(),
    },
    description: { 'zh-CN': form.descZh.trim(), 'en-US': form.descEn.trim() || form.descZh.trim() },
    schedule: {
      'zh-CN': form.scheduleZh.trim(),
      'en-US': form.scheduleEn.trim() || form.scheduleZh.trim(),
    },
    featured: form.featured,
  })
}
</script>

<template>
  <AModal
    :open="open"
    :title="title"
    :confirm-loading="saving"
    width="640px"
    @update:open="open = $event"
    @ok="onSubmit"
  >
    <div class="admin-course-form">
      <div class="admin-course-form__row">
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formName')"
          :validate-status="errors.name ? 'error' : ''"
          :help="errors.name"
        >
          <AInput v-model:value="form.nameZh" placeholder="简体中文" />
          <AInput v-model:value="form.nameEn" placeholder="English" class="admin-course-form__mt" />
        </AFormItem>
      </div>

      <div class="admin-course-form__row admin-course-form__row--two">
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formCategory')"
          :validate-status="errors.category ? 'error' : ''"
          :help="errors.category"
        >
          <ASelect v-model:value="form.category" :placeholder="t('admin.formCategory')">
            <ASelectOption v-for="cat in COURSE_CATEGORIES" :key="cat" :value="cat">
              {{ t(`course.categories.${cat}`) }}
            </ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formLevel')"
          :validate-status="errors.level ? 'error' : ''"
          :help="errors.level"
        >
          <ASelect v-model:value="form.level" :placeholder="t('admin.formLevel')">
            <ASelectOption v-for="lv in COURSE_LEVELS" :key="lv" :value="lv">
              {{ t(`course.levels.${lv}`) }}
            </ASelectOption>
          </ASelect>
        </AFormItem>
      </div>

      <div class="admin-course-form__row admin-course-form__row--two">
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formCoach')"
          :validate-status="errors.coach ? 'error' : ''"
          :help="errors.coach"
        >
          <AInput v-model:value="form.coach" />
        </AFormItem>
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formStartDate')"
          :validate-status="errors.startDate ? 'error' : ''"
          :help="errors.startDate"
        >
          <ADatePicker
            v-model:value="form.startDate"
            value-format="YYYY-MM-DD"
            class="admin-course-form__full"
          />
        </AFormItem>
      </div>

      <div class="admin-course-form__row admin-course-form__row--three">
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formDuration')"
          :validate-status="errors.durationMin ? 'error' : ''"
          :help="errors.durationMin"
        >
          <AInputNumber v-model:value="form.durationMin" :min="1" class="admin-course-form__full" />
        </AFormItem>
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formCapacity')"
          :validate-status="errors.capacity ? 'error' : ''"
          :help="errors.capacity"
        >
          <AInputNumber v-model:value="form.capacity" :min="1" class="admin-course-form__full" />
        </AFormItem>
        <AFormItem
          class="admin-course-form__item"
          :label="t('admin.formPrice')"
          :validate-status="errors.price ? 'error' : ''"
          :help="errors.price"
        >
          <AInputNumber v-model:value="form.price" :min="0" class="admin-course-form__full" />
        </AFormItem>
      </div>

      <AFormItem
        class="admin-course-form__item"
        :label="t('admin.formLocation')"
        :validate-status="errors.location ? 'error' : ''"
        :help="errors.location"
      >
        <AInput v-model:value="form.locationZh" placeholder="简体中文" />
        <AInput
          v-model:value="form.locationEn"
          placeholder="English"
          class="admin-course-form__mt"
        />
      </AFormItem>

      <AFormItem
        class="admin-course-form__item"
        :label="t('admin.formDesc')"
        :validate-status="errors.desc ? 'error' : ''"
        :help="errors.desc"
      >
        <ATextarea v-model:value="form.descZh" :rows="2" placeholder="简体中文" />
        <ATextarea
          v-model:value="form.descEn"
          :rows="2"
          placeholder="English"
          class="admin-course-form__mt"
        />
      </AFormItem>

      <AFormItem class="admin-course-form__item" :label="t('course.schedule')">
        <AInput v-model:value="form.scheduleZh" placeholder="简体中文" />
        <AInput
          v-model:value="form.scheduleEn"
          placeholder="English"
          class="admin-course-form__mt"
        />
      </AFormItem>

      <AFormItem class="admin-course-form__item" :label="t('home.featuredTitle')">
        <ASwitch v-model:checked="form.featured" />
      </AFormItem>
    </div>
  </AModal>
</template>

<style scoped>
.admin-course-form__row--two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ic-spacing-3, 12px);
}

.admin-course-form__row--three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--ic-spacing-3, 12px);
}

@media (max-width: 640px) {
  .admin-course-form__row--two,
  .admin-course-form__row--three {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.admin-course-form__full {
  width: 100%;
}

.admin-course-form__mt {
  margin-top: var(--ic-spacing-2, 8px);
}
</style>
