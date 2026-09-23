<script setup lang="ts">
import type { PointEntry } from '@isport/shared'
import { Button as AButton, Skeleton as ASkeleton, Tag as ATag, message } from 'antdv-next'

const { t } = useI18n()
const localePath = useLocalePath()
const { account, exchangeTiers, exchanging, exchange, refresh } = usePoints()
const [toast, ContextHolder] = message.useMessage()

const selectedTier = shallowRef<number>(exchangeTiers[0] ?? 0)

const available = computed(() => account.value?.available ?? 0)
const frozen = computed(() => account.value?.frozen ?? 0)
const entries = computed(() => account.value?.entries ?? [])
const orders = computed(() => account.value?.orders ?? [])
const insufficient = computed(() => available.value < selectedTier.value)

function entryAmount(entry: PointEntry) {
  return entry.amount > 0 ? `+${entry.amount}` : `${entry.amount}`
}

function entrySource(source: string) {
  if (source === 'profile') return t('points.sourceLabels.profile')
  if (source.startsWith('work:')) return t('points.sourceLabels.work')
  return t('points.sourceUnknown')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function onExchange() {
  if (!account.value) return
  const amount = selectedTier.value
  if (available.value < amount) {
    void toast.warning({ content: t('points.insufficientBalance'), duration: 2.5 })
    return
  }
  try {
    const order = await exchange(amount)
    const settled = account.value.orders.find(item => item.id === order.id) ?? order
    if (settled.status === 'succeeded') {
      void toast.success({ content: t('points.exchangeSucceeded'), duration: 2.5 })
    } else if (settled.status === 'failed') {
      void toast.error({ content: t('points.exchangeFailed'), duration: 2.5 })
    } else {
      void toast.info({ content: t('points.exchangePending'), duration: 2.5 })
    }
  } catch {
    void toast.error({ content: t('points.lingyueNotLinked'), duration: 2.5 })
  }
}

function goCreation() {
  void navigateTo(localePath('/admin/creation'))
}
function goLingyue() {
  void navigateTo(localePath('/lingyue/simulation'))
}
</script>

<template>
  <div class="points-feature">
    <ContextHolder />

    <header class="points-feature__head">
      <div>
        <h1 class="points-feature__title">{{ t('points.title') }}</h1>
        <p class="points-feature__desc">{{ t('points.mockNotice') }}</p>
      </div>
      <AButton @click="goCreation">{{ t('points.backToCreation') }}</AButton>
    </header>

    <ASkeleton v-if="!account" active :paragraph="{ rows: 6 }" class="points-feature__skeleton" />

    <template v-else>
      <div class="points-grid">
        <!-- 余额与兑换 -->
        <section class="card balance-card">
          <h2 class="card__title">{{ t('points.balanceTitle') }}</h2>
          <strong class="balance-card__value">{{ available }}</strong>
          <p class="balance-card__current">{{ t('points.available') }}</p>
          <p v-if="frozen > 0" class="balance-card__frozen">
            {{ t('points.frozen') }}：{{ frozen }}
          </p>

          <div class="exchange">
            <h3 class="exchange__title">{{ t('points.exchangeTitle') }}</h3>
            <p class="exchange__hint">{{ t('points.exchangeTiers') }}</p>
            <div class="exchange__tiers">
              <button
                v-for="tier in exchangeTiers"
                :key="tier"
                type="button"
                class="exchange__tier"
                :class="{ 'is-active': selectedTier === tier }"
                @click="selectedTier = tier"
              >
                {{ t('points.amountUnit', { amount: tier }) }}
              </button>
            </div>
            <AButton
              type="primary"
              block
              :loading="exchanging"
              :disabled="insufficient"
              @click="onExchange"
            >
              {{ t('points.exchangeNow') }}
            </AButton>
            <p v-if="insufficient" class="exchange__warn">
              {{ t('points.insufficientBalance') }}
            </p>
            <button type="button" class="exchange__link" @click="goLingyue">
              {{ t('points.lingyueLinkAction') }}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <!-- 积分流水 -->
        <section class="card entries-card">
          <header class="card__head">
            <h2 class="card__title">{{ t('points.entriesTitle') }}</h2>
            <button type="button" class="card__link" @click="refresh()">
              {{ t('points.refresh') }}
            </button>
          </header>
          <ul v-if="entries.length" class="entries">
            <li v-for="entry in entries" :key="entry.id" class="entry">
              <div class="entry__main">
                <span class="entry__kind">{{ t(`points.entryKinds.${entry.kind}`) }}</span>
                <span class="entry__source">{{ entrySource(entry.source) }}</span>
              </div>
              <div class="entry__side">
                <strong class="entry__amount" :class="{ 'is-gain': entry.amount > 0 }">
                  {{ entryAmount(entry) }}
                </strong>
                <time class="entry__date" :datetime="entry.createdAt">
                  {{ formatDate(entry.createdAt) }}
                </time>
              </div>
            </li>
          </ul>
          <p v-else class="entries__empty">{{ t('points.entriesEmpty') }}</p>
        </section>
      </div>

      <!-- 兑换记录 -->
      <section v-if="orders.length" class="card orders-card">
        <h2 class="card__title">{{ t('points.orderHistory') }}</h2>
        <ul class="orders">
          <li v-for="order in orders" :key="order.id" class="order">
            <span class="order__amount">{{
              t('points.amountUnit', { amount: order.amount })
            }}</span>
            <ATag
              :color="
                order.status === 'succeeded'
                  ? 'success'
                  : order.status === 'failed'
                    ? 'error'
                    : 'processing'
              "
            >
              {{ t(`points.orderStatus.${order.status}`) }}
            </ATag>
            <time class="order__date" :datetime="order.createdAt">
              {{ formatDate(order.createdAt) }}
            </time>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.points-feature {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-6, 24px);
  max-width: 1080px;
  margin-inline: auto;
  padding: var(--ic-spacing-6, 24px) var(--ic-spacing-4, 16px) 64px;
}

.points-feature__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ic-spacing-4, 16px);
}

.points-feature__title {
  margin: 0 0 6px;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-3xl, 30px);
  font-weight: var(--ic-font-weight-semibold, 600);
  letter-spacing: -0.01em;
}

.points-feature__desc {
  margin: 0;
  max-width: 52ch;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.points-feature__skeleton {
  padding: var(--ic-spacing-6, 24px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 16px);
  background: var(--ic-color-background-container, #fff);
}

.card {
  padding: var(--ic-spacing-6, 24px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 16px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ic-spacing-4, 16px);
}

.card__title {
  margin: 0;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-lg, 18px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.card__link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--ic-color-brand-600, #1d4ed8);
  font-size: var(--ic-font-size-sm, 14px);
  cursor: pointer;
}

.card__link:hover {
  text-decoration: underline;
}

.points-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: var(--ic-spacing-6, 24px);
  align-items: start;
}

/* 余额卡 */
.balance-card__value {
  display: block;
  margin-top: var(--ic-spacing-4, 16px);
  color: var(--ic-color-text-primary, #0f172a);
  font-size: 48px;
  font-weight: var(--ic-font-weight-semibold, 600);
  line-height: 1;
}

.balance-card__current {
  margin: 8px 0 0;
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-sm, 14px);
}

.balance-card__frozen {
  margin: 6px 0 0;
  color: var(--ic-semantic-warning, #d97706);
  font-size: var(--ic-font-size-sm, 14px);
}

.exchange {
  margin-top: var(--ic-spacing-6, 24px);
  padding-top: var(--ic-spacing-5, 20px);
  border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.exchange__title {
  margin: 0 0 4px;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.exchange__hint {
  margin: 0 0 12px;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.exchange__tiers {
  display: flex;
  gap: var(--ic-spacing-3, 12px);
  margin-bottom: var(--ic-spacing-4, 16px);
}

.exchange__tier {
  flex: 1 1 0;
  padding: 12px 8px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-page, #f8fafc);
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
  cursor: pointer;
  transition:
    border-color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard),
    background var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard),
    color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard);
}

.exchange__tier:hover {
  border-color: var(--ic-color-brand-300, #93c5fd);
}

.exchange__tier.is-active {
  border-color: var(--ic-color-brand-500, #2563eb);
  background: var(--ic-color-brand-50, #eff6ff);
  color: var(--ic-color-brand-600, #1d4ed8);
}

.exchange__warn {
  margin: 10px 0 0;
  color: var(--ic-semantic-warning, #d97706);
  font-size: var(--ic-font-size-sm, 14px);
}

.exchange__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ic-color-brand-600, #1d4ed8);
  font-size: var(--ic-font-size-sm, 14px);
  cursor: pointer;
}

.exchange__link:hover {
  text-decoration: underline;
}

/* 流水 */
.entries {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ic-spacing-3, 12px);
  padding: 14px 0;
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.entry:last-child {
  border-bottom: 0;
}

.entry__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry__kind {
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
}

.entry__source {
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-xs, 12px);
}

.entry__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.entry__amount {
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.entry__amount.is-gain {
  color: var(--ic-color-semantic-success, #16a34a);
}

.entry__date {
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-xs, 12px);
}

.entries__empty {
  margin: 0;
  padding: var(--ic-spacing-6, 24px);
  border: 1px dashed var(--ic-color-border-strong, #cbd5e1);
  border-radius: var(--ic-border-radius-lg, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-sm, 14px);
  text-align: center;
}

/* 兑换记录 */
.orders {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: var(--ic-spacing-4, 16px) 0 0;
  padding: 0;
  list-style: none;
}

.order {
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-3, 12px);
  padding: 12px 16px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-page, #f8fafc);
}

.order__amount {
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
}

.order__date {
  margin-inline-start: auto;
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-xs, 12px);
}

@media (max-width: 1023px) {
  .points-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
