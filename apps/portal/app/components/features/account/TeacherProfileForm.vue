<script setup lang="ts">
import {
  Alert as AAlert,
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Select as ASelect,
  message,
} from 'antdv-next'

const { t } = useI18n()
const { form, saving, error, success, isComplete, rewardAlreadyIssued, save } = useTeacherProfile()
const [toast, ContextHolder] = message.useMessage()
useSeoMeta({ title: () => t('creation.teacher.title') })

watch(success, v => {
  if (v) void toast.success({ content: t('creation.teacher.saved'), duration: 2.5 })
})

const roleOptions = [
  { value: 'teacher', label: '科任教师' },
  { value: 'leader', label: '教研组长' },
  { value: 'head', label: '分管主任' },
]
const stageOptions = [
  { value: 'primary', label: '小学' },
  { value: 'junior', label: '初中' },
  { value: 'senior', label: '高中' },
]
</script>

<template>
  <main class="teacher-profile ic-container">
    <ContextHolder />
    <h1>{{ t('creation.teacher.title') }}</h1>
    <p class="teacher-profile__desc">{{ t('creation.teacher.desc') }}</p>
    <AAlert
      v-if="!rewardAlreadyIssued"
      type="info"
      show-icon
      :title="t('creation.teacher.rewardHint', { amount: 20 })"
      class="teacher-profile__reward"
    />
    <AAlert
      v-else
      type="success"
      show-icon
      :title="t('creation.teacher.alreadyRewarded')"
      class="teacher-profile__reward"
    />
    <AAlert v-if="error" type="error" show-icon :title="error" class="teacher-profile__alert" />
    <AForm layout="vertical" class="teacher-profile__form" @submit.prevent="save">
      <AFormItem :label="t('creation.teacher.realName')" required>
        <AInput v-model:value="form.realName" :maxlength="50" />
      </AFormItem>
      <div class="teacher-profile__row">
        <AFormItem :label="t('creation.teacher.province')" required class="teacher-profile__col">
          <AInput v-model:value="form.province" :maxlength="50" />
        </AFormItem>
        <AFormItem :label="t('creation.teacher.city')" required class="teacher-profile__col">
          <AInput v-model:value="form.city" :maxlength="50" />
        </AFormItem>
        <AFormItem :label="t('creation.teacher.district')" required class="teacher-profile__col">
          <AInput v-model:value="form.district" :maxlength="50" />
        </AFormItem>
      </div>
      <AFormItem :label="t('creation.teacher.school')" required>
        <AInput v-model:value="form.school" :maxlength="100" />
      </AFormItem>
      <div class="teacher-profile__row">
        <AFormItem :label="t('creation.teacher.teacherRole')" required class="teacher-profile__col">
          <ASelect
            v-model:value="form.teacherRole"
            :options="roleOptions"
            :placeholder="t('creation.teacher.teacherRole')"
          />
        </AFormItem>
        <AFormItem :label="t('creation.teacher.stage')" required class="teacher-profile__col">
          <ASelect
            v-model:value="form.stage"
            :options="stageOptions"
            :placeholder="t('creation.teacher.stage')"
          />
        </AFormItem>
      </div>
      <AFormItem :label="t('creation.teacher.subject')" required>
        <AInput v-model:value="form.subject" :maxlength="50" />
      </AFormItem>
      <AFormItem>
        <AButton type="primary" :loading="saving" :disabled="!isComplete" native-type="submit">
          {{ t('common.save') }}
        </AButton>
      </AFormItem>
    </AForm>
  </main>
</template>

<style scoped>
.teacher-profile {
  max-width: 640px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.teacher-profile :deep(h1) {
  margin: 0 0 8px;
  font-size: var(--ic-font-size-3xl, 28px);
  letter-spacing: -0.01em;
}

.teacher-profile__desc {
  margin: 0 0 16px;
  color: var(--ic-color-text-secondary, #64748b);
}

.teacher-profile__reward,
.teacher-profile__alert {
  margin-bottom: 16px;
}

.teacher-profile__form {
  padding: 24px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 14px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
}

.teacher-profile__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.teacher-profile__col {
  min-width: 0;
}

@media (max-width: 480px) {
  .teacher-profile__form {
    padding: 16px;
  }

  .teacher-profile__row {
    grid-template-columns: 1fr;
  }
}
</style>
