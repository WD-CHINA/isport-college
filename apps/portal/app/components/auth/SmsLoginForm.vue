<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
const props = defineProps<{
  sending: boolean
  submitting: boolean
  remaining: number
  error: string
}>()
defineEmits<{ send: []; submit: [] }>()
const phone = defineModel<string>('phone', { required: true })
const code = defineModel<string>('code', { required: true })
const agreed = defineModel<boolean>('agreed', { required: true })
const { t } = useI18n()
const localePath = useLocalePath()
const ready = computed(
  () => /^1\d{10}$/.test(phone.value) && /^\d{6}$/.test(code.value) && agreed.value,
)

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => props.error,
  () => props.error,
)
</script>

<template>
  <form class="sms-form" novalidate @submit.prevent="$emit('submit')">
    <ContextHolder />
    <div class="sms-form__field">
      <label for="login-phone">{{ t('academy.phone') }}</label>
      <AInput
        id="login-phone"
        v-model:value="phone"
        :disabled="submitting || sending"
        :maxlength="11"
        inputmode="tel"
        autocomplete="tel"
        size="large"
        :placeholder="t('auth.phonePlaceholder')"
      />
    </div>
    <div class="sms-form__field">
      <label for="login-code">{{ t('auth.codeLabel') }}</label>
      <div class="sms-form__code">
        <AInput
          id="login-code"
          v-model:value="code"
          :placeholder="t('auth.codePlaceholder')"
          :disabled="submitting"
          :maxlength="6"
          inputmode="numeric"
          autocomplete="one-time-code"
          size="large"
        />
        <AButton
          type="text"
          ghost
          :loading="sending"
          :disabled="remaining > 0 || submitting"
          size="large"
          @click="$emit('send')"
        >
          {{ remaining ? t('academy.retryAfter', { seconds: remaining }) : t('academy.sendCode') }}
        </AButton>
      </div>
    </div>
    <div class="sms-form__agreement">
      <ACheckbox v-model:checked="agreed" :disabled="submitting">{{
        t('academy.agree')
      }}</ACheckbox>
      <NuxtLink :to="localePath('/legal/terms')" target="_blank">{{
        t('auth.termsLink')
      }}</NuxtLink>
      {{ t('auth.agreementAnd') }}
      <NuxtLink :to="localePath('/legal/privacy')" target="_blank">{{
        t('auth.privacyLink')
      }}</NuxtLink>
    </div>
    <AButton
      type="primary"
      html-type="submit"
      size="large"
      :disabled="!ready"
      :loading="submitting"
      block
      >{{ t('common.login') }}</AButton
    >
  </form>
</template>

<style scoped>
.sms-form {
  display: grid;
  gap: 24px;
  color: #1c1f23;
}

.sms-form__field {
  display: grid;
  gap: 10px;
}

.sms-form__field > label {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.sms-form__field :deep(.ant-input) {
  height: 40px;
  border-radius: 5px;
  font-size: 16px;
}

.sms-form__code {
  display: flex;
  overflow: hidden;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}

.sms-form__code :deep(input) {
  min-width: 0;
  border: 0;
  box-shadow: none;
}

.sms-form__code :deep(.ant-btn) {
  flex: none;
  padding-inline: 12px;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #0077fa;
  box-shadow: none;
}

.sms-form__agreement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: #808080;
  font-size: 14px;
  line-height: 20px;
}

.sms-form__agreement a {
  color: #0077fa;
}

.sms-form > :deep(.ant-btn-primary) {
  height: 40px;
  border: 0;
  border-radius: 6px;
  background: #0077fa;
  box-shadow: none;
}

.sms-form > :deep(.ant-btn-primary:disabled),
.sms-form > :deep(.ant-btn-primary.ant-btn-disabled) {
  border: 0;
  background: #e6e8ea;
  color: rgb(28 31 35 / 35%);
}
</style>
