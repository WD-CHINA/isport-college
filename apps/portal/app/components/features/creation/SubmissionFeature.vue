<script setup lang="ts">
import type { SubmissionKind } from '@isport/shared'
import {
  Alert as AAlert,
  Button as AButton,
  Checkbox as ACheckbox,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  message,
} from 'antdv-next'

const props = defineProps<{ editId?: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const {
  kind,
  fields,
  taxonomies,
  coverSlot,
  fileSlot,
  saving,
  submitting,
  formError,
  successMsg,
  setKind,
  markDirty,
  uploadCover,
  uploadContentFile,
  removeContentFile,
  saveDraft,
  submit,
} = useSubmission(props.editId)

const [toast, ContextHolder] = message.useMessage()

watch(successMsg, v => {
  if (v) void toast.success({ content: v, duration: 2.5 })
})

useSeoMeta({
  title: () => (props.editId ? t('creation.submission.editTitle') : t('creation.submission.title')),
})

const kindOptions = [
  { value: 'demonstration', label: t('creation.entries.demonstration') },
  { value: 'courseware', label: t('creation.entries.courseware') },
  { value: 'micro', label: t('creation.entries.micro') },
  { value: 'lesson', label: t('creation.entries.lesson') },
  { value: 'practice', label: t('creation.entries.practice') },
]

const levelOptions = [1, 2, 3, 4, 5].map(v => ({
  value: v,
  label: t('catalog.levelValue', { level: v }),
}))

const taxonomyOptions = computed(() =>
  (taxonomies.value ?? []).map(tx => ({
    value: tx.id,
    label: tx.label['zh-CN'] ?? tx.id,
  })),
)

const isPractice = computed(() => kind.value === 'practice')

const coverInput = useTemplateRef<HTMLInputElement>('coverInput')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function pickCover(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) void uploadCover(file)
}
function pickFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) void uploadContentFile(file)
}

// 实践案例：链接模式
const practiceModeOptions = [
  { value: 'article', label: t('creation.submission.modeArticle') },
  { value: 'link', label: t('creation.submission.modeLink') },
]
</script>

<template>
  <div class="submission ic-container">
    <ContextHolder />
    <header class="submission__header">
      <h1>
        {{ props.editId ? t('creation.submission.editTitle') : t('creation.submission.title') }}
      </h1>
      <NuxtLink :to="localePath('/admin/works')">
        <AButton type="text">&larr; {{ t('creation.works.title') }}</AButton>
      </NuxtLink>
    </header>

    <!-- 投稿类型 -->
    <section class="submission__kind">
      <h2>{{ t('creation.submission.selectType') }}</h2>
      <ARadioGroup
        v-model:value="kind"
        button-style="solid"
        @change="setKind(kind as SubmissionKind)"
      >
        <ARadio v-for="opt in kindOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </ARadio>
      </ARadioGroup>
    </section>

    <AAlert v-if="formError" type="error" show-icon :title="formError" class="submission__alert" />

    <AForm layout="vertical" class="submission__form" @submit.prevent="submit">
      <!-- 标题 -->
      <AFormItem :label="t('creation.submission.formTitle')" required>
        <AInput
          v-model:value="fields.title"
          :maxlength="80"
          :placeholder="t('creation.submission.formTitlePlaceholder')"
          @input="markDirty"
        />
      </AFormItem>

      <!-- 封面 -->
      <AFormItem :label="t('creation.submission.formCover')" required>
        <div class="submission__cover">
          <input
            ref="coverInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            @change="pickCover"
          />
          <div v-if="coverSlot.uploading" class="submission__uploading">
            {{ t('creation.file.uploading') }}
          </div>
          <AAlert v-else-if="coverSlot.error" type="error" :title="coverSlot.error" show-icon />
          <div v-else-if="coverSlot.record" class="submission__file-info">
            <span>{{ coverSlot.record.name }}</span>
            <AButton
              size="small"
              @click="
                coverSlot.record = null
                fields.cover = ''
              "
            >
              {{ t('creation.file.replaceFile') }}
            </AButton>
          </div>
          <AButton v-else @click="coverInput?.click()">{{ t('creation.file.selectFile') }}</AButton>
        </div>
        <p class="submission__hint">
          {{ t('creation.file.coverLabel') }} · {{ t('creation.file.mockNotice') }}
        </p>
      </AFormItem>

      <!-- 分类 -->
      <AFormItem :label="t('creation.submission.formCategory')" required>
        <ASelect
          v-model:value="fields.category"
          :options="taxonomyOptions"
          :placeholder="t('creation.submission.formCategory')"
          @change="markDirty"
        />
      </AFormItem>

      <!-- 推荐水平（仅 demonstration / courseware） -->
      <AFormItem
        v-if="kind === 'demonstration' || kind === 'courseware'"
        :label="t('creation.submission.formLevel')"
        required
      >
        <ASelect
          v-model:value="fields.level"
          :options="levelOptions"
          :placeholder="t('creation.submission.formLevel')"
          @change="markDirty"
        />
      </AFormItem>

      <!-- 简介 -->
      <AFormItem :label="t('creation.submission.formSummary')">
        <AInput
          v-model:value="fields.summary"
          type="textarea"
          :maxlength="1000"
          :rows="3"
          @input="markDirty"
        />
      </AFormItem>

      <!-- 内容区域 -->
      <!-- 文件上传模式（demonstration/courseware/micro/lesson 默认，micro/lesson 可切换） -->
      <AFormItem v-if="!isPractice" :label="t('creation.submission.modeFile')">
        <input
          ref="fileInput"
          type="file"
          hidden
          :accept="kind === 'courseware' ? '.pdf,.ppt,.pptx' : '.mp4,.webm'"
          @change="pickFile"
        />
        <div v-if="fileSlot.uploading" class="submission__uploading">
          {{ t('creation.file.uploading') }}
        </div>
        <AAlert v-else-if="fileSlot.error" type="error" :title="fileSlot.error" show-icon />
        <div v-else-if="fileSlot.record" class="submission__file-info">
          <span>{{ fileSlot.record.name }}（{{ Math.ceil(fileSlot.record.size / 1024) }} KB）</span>
          <AButton size="small" @click="removeContentFile">{{
            t('creation.file.removeFile')
          }}</AButton>
        </div>
        <AButton v-else @click="fileInput?.click()">{{ t('creation.file.selectFile') }}</AButton>
        <p class="submission__hint">{{ t(`creation.submission.fileTypes.${kind}`) }}</p>
      </AFormItem>

      <!-- 实践案例模式选择 -->
      <template v-if="isPractice">
        <AFormItem :label="t('creation.submission.formContent')">
          <ARadioGroup v-model:value="fields.mode" @change="markDirty">
            <ARadio v-for="opt in practiceModeOptions" :key="opt.value" :value="opt.value">{{
              opt.label
            }}</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem v-if="fields.mode === 'article'" :label="t('creation.submission.modeArticle')">
          <AInput
            v-model:value="fields.body"
            type="textarea"
            :rows="8"
            :placeholder="t('creation.submission.articlePlaceholder')"
            @input="markDirty"
          />
        </AFormItem>
        <AFormItem v-if="fields.mode === 'link'" :label="t('creation.submission.modeLink')">
          <AInput
            v-model:value="fields.url"
            :placeholder="t('creation.submission.linkPlaceholder')"
            @input="markDirty"
          />
          <p class="submission__hint">{{ t('creation.submission.linkNotice') }}</p>
        </AFormItem>
      </template>

      <!-- 声明 -->
      <div class="submission__declarations">
        <ACheckbox v-model:checked="fields.copyright" @change="markDirty">
          {{ t('creation.submission.copyright') }}
        </ACheckbox>
        <ACheckbox v-model:checked="fields.privacy" @change="markDirty">
          {{ t('creation.submission.privacy') }}
        </ACheckbox>
      </div>

      <!-- 操作按钮 -->
      <div class="submission__actions">
        <AButton :loading="saving" @click="saveDraft">{{
          t('creation.submission.saveDraft')
        }}</AButton>
        <AButton type="primary" :loading="submitting" @click="submit">
          {{ t('creation.submission.submitReview') }}
        </AButton>
      </div>
    </AForm>
  </div>
</template>

<style scoped>
.submission {
  max-width: 720px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.submission__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.submission__header h1 {
  margin: 0;
  font-size: var(--ic-font-size-2xl, 26px);
  letter-spacing: -0.01em;
}

.submission__kind {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.submission__kind h2 {
  margin: 0 0 12px;
  font-size: var(--ic-font-size-base, 16px);
  color: var(--ic-color-text-secondary, #475569);
}

.submission__alert {
  margin-bottom: 16px;
}

.submission__uploading {
  color: var(--ic-color-brand-500, #2563eb);
  font-size: var(--ic-font-size-sm, 14px);
}

.submission__file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-background-page, #f8fafc);
}

.submission__hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.submission__declarations {
  display: grid;
  gap: 10px;
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 10px);
  background: var(--ic-color-background-page, #f8fafc);
}

.submission__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
