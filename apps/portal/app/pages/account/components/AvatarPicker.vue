<script setup lang="ts">
import AccountAvatar from '~/components/auth/AccountAvatar.vue'

defineProps<{ options: number[]; value: number; pending: boolean }>()
const emit = defineEmits<{ select: [code: number] }>()
const { t } = useI18n()
</script>

<template>
  <div class="avatar-picker" role="group" :aria-label="t('academy.avatar')">
    <button
      v-for="code in options"
      :key="code"
      type="button"
      :aria-label="t('account.avatarOption', { code })"
      :aria-pressed="value === code"
      :disabled="pending"
      @click="emit('select', code)"
    >
      <AccountAvatar :avatar-code="code" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-3);

  button {
    padding: var(--ic-spacing-2);
    border: 2px solid transparent;
    border-radius: var(--ic-border-radius-full);
    background: transparent;
    cursor: pointer;

    &[aria-pressed='true'] {
      border-color: var(--ic-color-academy-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--ic-color-academy-primary);
    }

    &:disabled {
      cursor: wait;
    }
  }
}
</style>
