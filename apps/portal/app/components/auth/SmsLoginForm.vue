<script setup lang="ts">
import {
  Alert as AAlert,
  Button as AButton,
  Checkbox as ACheckbox,
  Input as AInput,
} from 'antdv-next'

defineProps<{
  sending: boolean
  submitting: boolean
  remaining: number
  error: string
  demoCode?: string
}>()
defineEmits<{ send: []; submit: [] }>()
const phone = defineModel<string>('phone', { required: true })
const code = defineModel<string>('code', { required: true })
const agreed = defineModel<boolean>('agreed', { required: true })
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <form class="sms-form" novalidate @submit.prevent="$emit('submit')">
    <AAlert type="info" :title="t('academy.smsMock')" show-icon />
    <p v-if="demoCode" data-testid="demo-code">{{ t('academy.demoCode', { code: demoCode }) }}</p>
    <AAlert v-if="error" type="error" :title="error" role="alert" show-icon />
    <label for="login-phone">{{ t('academy.phone') }}</label>
    <AInput
      id="login-phone"
      v-model:value="phone"
      :disabled="submitting || sending"
      :maxlength="11"
      inputmode="tel"
      autocomplete="tel"
      size="large"
    />
    <label for="login-code">{{ t('academy.smsCode') }}</label>
    <div class="sms-form__code">
      <AInput
        id="login-code"
        v-model:value="code"
        :disabled="submitting"
        :maxlength="6"
        inputmode="numeric"
        autocomplete="one-time-code"
        size="large"
      />
      <AButton
        :loading="sending"
        :disabled="remaining > 0 || submitting"
        size="large"
        @click="$emit('send')"
      >
        {{ remaining ? t('academy.retryAfter', { seconds: remaining }) : t('academy.sendCode') }}
      </AButton>
    </div>
    <div>
      <ACheckbox v-model:checked="agreed" :disabled="submitting">{{
        t('academy.agree')
      }}</ACheckbox>
      <NuxtLink :to="localePath('/legal/terms')" target="_blank">{{ t('academy.terms') }}</NuxtLink>
      ·
      <NuxtLink :to="localePath('/legal/privacy')" target="_blank">{{
        t('academy.privacy')
      }}</NuxtLink>
    </div>
    <AButton type="primary" html-type="submit" size="large" :loading="submitting" block>{{
      t('common.login')
    }}</AButton>
  </form>
</template>

<style scoped>
.sms-form {
  display: grid;
  gap: var(--ic-spacing-3, 12px);
}

.sms-form__code {
  display: flex;
  gap: var(--ic-spacing-2, 8px);
}

.sms-form__code :deep(input) {
  min-width: 0;
}
</style>
