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

<style lang="scss" scoped>
.sms-form {
  display: grid;
  gap: 24px;
  color: var(--ic-color-academy-text-primary);

  &__field {
    display: grid;
    gap: 10px;

    > label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
    }

    :deep(.ant-input) {
      height: 40px;
      border-radius: 5px;
      font-size: 16px;
    }
  }

  &__code {
    display: flex;
    overflow: hidden;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 5px;

    :deep(input) {
      min-width: 0;
      border: 0;
      box-shadow: none;
    }

    :deep(.ant-btn) {
      flex: none;
      padding-inline: 12px;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;

      --ant-btn-text-color: var(--ic-color-academy-primary) !important;

      box-shadow: none;
    }
  }

  &__agreement {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    color: #808080;
    font-size: 14px;
    line-height: 20px;

    a {
      color: var(--ic-color-academy-primary);
    }
  }

  > :deep(.ant-btn-primary) {
    height: 40px;
    border: 0;
    border-radius: 6px;
    background: var(--ic-color-academy-primary);
    box-shadow: none;
  }

  & > :deep(.ant-btn-primary:disabled),
  & > :deep(.ant-btn-primary.ant-btn-disabled) {
    border: 0;
    background: #e6e8ea;
    color: var(--ic-color-academy-text-disabled);
  }
}
</style>
