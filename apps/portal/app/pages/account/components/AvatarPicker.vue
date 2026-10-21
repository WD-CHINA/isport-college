<script setup lang="ts">
import AccountAvatar from '~/components/auth/AccountAvatar.vue'

const props = defineProps<{
  open: boolean
  options: number[]
  value: number
  pending: boolean
  loading: boolean
  failed: boolean
}>()
const emit = defineEmits<{ cancel: []; retry: []; confirm: [code: number] }>()
const { t } = useI18n()
const selected = shallowRef(props.value)
watch(
  () => props.open,
  open => {
    if (open) selected.value = props.value
  },
)
const selectedLabel = computed(() => String(selected.value).padStart(2, '0'))
function cancel() {
  if (!props.pending) emit('cancel')
}
</script>

<template>
  <AModal
    :open="open"
    :title="t('academy.avatar')"
    :width="520"
    :footer="null"
    :classes="{ container: 'account-avatar-modal' }"
    :styles="{
      container: {
        padding: 'var(--account-avatar-padding)',
        borderRadius: '16px',
        minHeight: 'var(--account-avatar-min-height)',
      },
      header: { marginBottom: '6px' },
    }"
    :closable="!pending"
    :mask-closable="!pending"
    :keyboard="!pending"
    centered
    destroy-on-hidden
    @cancel="cancel"
  >
    <p class="avatar-picker__subtitle">{{ t('account.avatarSubtitle') }}</p>
    <div v-if="failed" class="avatar-picker__status" role="alert">
      <p>{{ t('academy.requestFailed') }}</p>
      <AButton @click="emit('retry')">{{ t('catalog.retry') }}</AButton>
    </div>
    <ASkeleton v-else-if="loading" class="avatar-picker__status" active />
    <div
      v-else-if="options.length"
      class="avatar-picker"
      role="group"
      :aria-label="t('academy.avatar')"
    >
      <button
        v-for="code in options"
        :key="code"
        type="button"
        :aria-label="t('account.avatarOption', { code })"
        :aria-pressed="selected === code"
        :disabled="pending"
        @click="selected = code"
      >
        <AccountAvatar :avatar-code="code" />
      </button>
    </div>
    <p v-else class="avatar-picker__status">{{ t('account.avatarEmpty') }}</p>
    <div class="avatar-picker__footer">
      <span role="status">{{ t('account.avatarSelected', { code: selectedLabel }) }}</span>
      <AButton :disabled="pending" @click="cancel">{{ t('common.cancel') }}</AButton>
      <AButton
        type="primary"
        :loading="pending"
        :disabled="loading || failed || !options.includes(selected)"
        @click="emit('confirm', selected)"
        >{{ t('account.avatarConfirm') }}</AButton
      >
    </div>
  </AModal>
</template>

<style lang="scss">
.account-avatar-modal {
  --account-avatar-padding: 26px 32px 40px;
  --account-avatar-min-height: 480px;

  .ant-modal-title {
    font-size: 24px;
    line-height: 36px;
  }

  .avatar-picker {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px 8px;
    margin: 28px 0 24px;

    button {
      display: grid;
      min-width: 0;
      height: 106px;
      place-items: center;
      padding: 8px;
      border: 0;
      border-radius: 10px;
      background: transparent;
      cursor: pointer;
    }

    .account-avatar {
      width: 80px;
      height: 80px;
    }

    button[aria-pressed='true'] .account-avatar {
      outline: 2px solid var(--ic-color-academy-primary);
      outline-offset: 6px;
    }

    button:focus-visible {
      outline: 2px solid var(--ic-color-academy-primary);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: wait;
    }

    &__subtitle {
      margin: 0;
      color: var(--ic-color-academy-text-caption);
      font-size: 14px;
      line-height: 21px;
    }

    &__status {
      display: grid;
      align-content: center;
      justify-items: center;
      min-height: 264px;
      margin: 0;
      gap: 16px;
      color: var(--ic-color-academy-text-caption);
    }

    &__footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid var(--ic-color-academy-border-panel);
    }

    &__footer > span {
      flex: 1;
      color: var(--ic-color-academy-text-caption);
      font-size: 13px;
      line-height: 20px;
    }

    &__footer .ant-btn {
      height: 40px;
      border: 0;
      border-radius: 6px;
      padding-inline: 24px;
      box-shadow: none;
    }

    &__footer .ant-btn-default {
      --ant-btn-bg-color: var(--ic-color-academy-tint) !important;
      --ant-btn-text-color: var(--ic-color-academy-primary) !important;
    }

    &__footer .ant-btn-primary {
      background: var(--ic-color-academy-primary);
    }
  }
}

@media (max-width: 575px) {
  .account-avatar-modal {
    --account-avatar-padding: 24px 20px;
    --account-avatar-min-height: 0px;

    .avatar-picker {
      gap: 12px 4px;
    }

    .avatar-picker button {
      height: 76px;
      padding: 6px;
    }

    .avatar-picker .account-avatar {
      width: 48px;
      height: 48px;
    }

    .avatar-picker__footer > span {
      flex-basis: 100%;
    }

    .avatar-picker__footer .ant-btn:first-of-type {
      margin-left: auto;
    }
  }
}
</style>
