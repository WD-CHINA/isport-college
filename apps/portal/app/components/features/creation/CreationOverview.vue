<script setup lang="ts">
import type { Work } from '@isport/shared'
import { Button as AButton } from 'antdv-next'
import CreationTypes from './CreationTypes.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const academy = useAcademy()

// 概览统计：已发布/草稿箱/审核中数量、最新已发布作品、积分余额与本月收支。
const stats = reactive({ published: 0, drafts: 0, pending: 0 })
const points = reactive({ available: 0, monthGain: 0, monthSpend: 0 })
const latestWork = shallowRef<Work | null>(null)

async function loadSummary() {
  if (!auth.isLoggedIn) return
  try {
    const [published, drafts, pending] = await Promise.all([
      academy.call('work/list', { page: 1, pageSize: 1, status: 'published' }),
      academy.call('work/list', { page: 1, pageSize: 1, status: 'draft' }),
      academy.call('work/list', { page: 1, pageSize: 1, status: 'pending' }),
    ])
    stats.published = published.total
    stats.drafts = drafts.total
    stats.pending = pending.total
    latestWork.value = published.list[0] ?? null
  } catch {
    /* 忽略列表加载失败，保持默认 0 */
  }
  try {
    const account = await academy.call('points/account', {})
    points.available = account.available
    const now = new Date()
    const sameMonth = (iso: string) => {
      const d = new Date(iso)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }
    points.monthGain = account.entries
      .filter(entry => entry.kind === 'reward' && sameMonth(entry.createdAt))
      .reduce((sum, entry) => sum + entry.amount, 0)
    points.monthSpend = account.entries
      .filter(
        entry => (entry.kind === 'spend' || entry.kind === 'freeze') && sameMonth(entry.createdAt),
      )
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0)
  } catch {
    /* P0 或未登录时积分接口会被拒绝，忽略 */
  }
}

watch(
  () => auth.user?.id,
  () => {
    void loadSummary()
  },
  { immediate: true },
)

// 游客可浏览概览，涉及个人数据或投稿的动作先唤起登录。
function requireLogin(redirect: string) {
  if (!auth.isLoggedIn) {
    auth.openLoginModal({ reason: 'account', redirect })
    return false
  }
  return true
}

function goSubmit() {
  const target = localePath('/admin/works/submit')
  if (requireLogin(target)) void navigateTo(target)
}
function goWorks() {
  const target = localePath('/admin/works')
  if (requireLogin(target)) void navigateTo(target)
}
function goPoints() {
  const target = localePath('/admin/points')
  if (requireLogin(target)) void navigateTo(target)
}
function goWork(id: string) {
  const target = localePath(`/admin/works/${id}`)
  if (requireLogin(target)) void navigateTo(target)
}
function onSelectType(kind: string) {
  const target = localePath(`/admin/works/submit?kind=${kind}`)
  if (requireLogin(target)) void navigateTo(target)
}
</script>

<template>
  <div class="creation-overview">
    <!-- 顶部 Hero：品牌绿横幅 + 三步流程 -->
    <section class="hero">
      <div class="hero__intro">
        <p class="hero__eyebrow">{{ t('creation.hero.eyebrow') }}</p>
        <h1 class="hero__title">{{ t('creation.hero.title') }}</h1>
        <p class="hero__desc">{{ t('creation.hero.desc') }}</p>
        <div class="hero__actions">
          <AButton type="primary" size="large" class="hero__cta" @click="goSubmit">
            <svg class="hero__cta-icon" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13.5V15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15v-1.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('creation.entries.upload') }}
          </AButton>
          <AButton size="large" class="hero__ghost" @click="goWorks">
            {{ t('creation.entries.works') }}
          </AButton>
        </div>
      </div>

      <ol class="hero__steps">
        <li class="step">
          <span class="step__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 15V4m0 0L8 8m4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <strong class="step__title">{{ t('creation.steps.submit.title') }}</strong>
          <span class="step__desc">{{ t('creation.steps.submit.desc') }}</span>
        </li>
        <li class="step">
          <span class="step__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="m9 12 2 2 4-4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <strong class="step__title">{{ t('creation.steps.review.title') }}</strong>
          <span class="step__desc">{{ t('creation.steps.review.desc') }}</span>
        </li>
        <li class="step">
          <span class="step__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M5 19c1-4 4-9 12-14-1 8-6 11-9 12l-3 2Zm0 0 3-3"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <strong class="step__title">{{ t('creation.steps.publish.title') }}</strong>
          <span class="step__desc">{{ t('creation.steps.publish.desc') }}</span>
        </li>
      </ol>
    </section>

    <!-- 概览：我的创作 + 共创积分 -->
    <div class="overview-grid">
      <section class="card works-card">
        <header class="card__head">
          <h2 class="card__title">{{ t('creation.myWorksCard.title') }}</h2>
          <button type="button" class="card__link" @click="goWorks">
            {{ t('creation.myWorksCard.viewAll') }}
            <span aria-hidden="true">→</span>
          </button>
        </header>

        <div class="works-card__stats">
          <div class="stat">
            <span class="stat__label">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="m7 10 2 2 4-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ t('creation.myWorksCard.published') }}
            </span>
            <strong class="stat__value">{{ stats.published }}</strong>
          </div>
          <div class="stat">
            <span class="stat__label">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M6 3.5h6l3 3v10H6z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                  stroke-dasharray="2 2"
                />
              </svg>
              {{ t('creation.myWorksCard.drafts') }}
            </span>
            <strong class="stat__value">{{ stats.drafts }}</strong>
          </div>
          <div class="stat">
            <span class="stat__label">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M10 6.5V10l2.5 1.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              {{ t('creation.myWorksCard.pending') }}
            </span>
            <strong class="stat__value">{{ stats.pending }}</strong>
          </div>
        </div>

        <div class="works-card__latest">
          <span class="latest__label">{{ t('creation.myWorksCard.latest') }}</span>
          <div v-if="latestWork" class="latest__body">
            <span class="latest__tag">{{ t('creation.myWorksCard.latestTag') }}</span>
            <button type="button" class="latest__link" @click="goWork(latestWork.id)">
              {{ t('creation.myWorksCard.viewWork') }}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p v-else class="latest__empty">{{ t('creation.myWorksCard.latestEmpty') }}</p>
        </div>
      </section>

      <section class="card points-card">
        <header class="card__head">
          <h2 class="card__title">{{ t('creation.pointsCard.title') }}</h2>
          <span class="points-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6" />
              <circle
                cx="15"
                cy="15"
                r="5.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
              />
            </svg>
          </span>
        </header>
        <strong class="points-card__value">{{ points.available }}</strong>
        <p class="points-card__current">{{ t('creation.pointsCard.current') }}</p>
        <dl class="points-card__rows">
          <div class="points-card__row">
            <dt>{{ t('creation.pointsCard.monthGain') }}</dt>
            <dd>+{{ points.monthGain }}</dd>
          </div>
          <div class="points-card__row">
            <dt>{{ t('creation.pointsCard.monthSpend') }}</dt>
            <dd>-{{ points.monthSpend }}</dd>
          </div>
        </dl>
        <AButton block class="points-card__cta" @click="goPoints">
          {{ t('creation.pointsCard.viewDetail') }}
        </AButton>
      </section>
    </div>

    <!-- 分享内容：类型选择 -->
    <section class="card share-card">
      <header class="share-card__head">
        <div class="share-card__heading">
          <h2 class="share-card__title">
            {{ t('creation.share.title') }}
            <span class="share-card__badge">{{ t('creation.share.limitedTag') }}</span>
          </h2>
          <p class="share-card__desc">{{ t('creation.share.desc') }}</p>
        </div>
        <ul class="share-card__assure">
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M4 16l1-4 8-8 3 3-8 8-4 1Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('creation.share.original') }}
          </li>
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle
                cx="10"
                cy="10"
                r="7.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
              />
              <path
                d="M12.5 8a3 3 0 1 0 0 4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
            {{ t('creation.share.copyright') }}
          </li>
          <li>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M10 3l5 2v4c0 3.5-2.2 6-5 7.5C7.2 15 5 12.5 5 9V5l5-2Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('creation.share.privacy') }}
          </li>
        </ul>
      </header>
      <p class="share-card__label">{{ t('creation.share.resourcesLabel') }}</p>
      <CreationTypes @select="onSelectType" />
    </section>
  </div>
</template>

<style scoped>
.creation-overview {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-6, 24px);
  max-width: 1280px;
  margin-inline: auto;
  padding: var(--ic-spacing-6, 24px) var(--ic-spacing-4, 16px) 64px;
}

/* Hero */
.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ic-spacing-8, 32px);
  padding: var(--ic-spacing-8, 40px);
  border-radius: var(--ic-border-radius-xl, 16px);
  background: linear-gradient(135deg, #0e2a1d 0%, #123524 100%);
  box-shadow: var(--ic-box-shadow-lg, 0 12px 28px -8px rgb(14 42 29 / 45%));
}

.hero__intro {
  flex: 1 1 340px;
  min-width: min(100%, 340px);
}

.hero__eyebrow {
  margin: 0 0 12px;
  color: #a7f04a;
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-semibold, 600);
  letter-spacing: 0.04em;
}

.hero__title {
  margin: 0 0 16px;
  color: var(--ic-color-text-inverse, #fff);
  font-size: var(--ic-font-size-4xl, 36px);
  font-weight: var(--ic-font-weight-semibold, 600);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.hero__desc {
  max-width: 46ch;
  margin: 0 0 28px;
  color: #c7dbcf;
  font-size: var(--ic-font-size-base, 16px);
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-3, 12px);
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #c6f24e;
  border-color: #c6f24e;
  color: #0e2a1d;
  font-weight: var(--ic-font-weight-semibold, 600);
}

.hero__cta:hover {
  background: #d3f771 !important;
  border-color: #d3f771 !important;
  color: #0e2a1d !important;
}

.hero__cta-icon {
  width: 18px;
  height: 18px;
}

.hero__ghost {
  background: transparent;
  border-color: rgb(255 255 255 / 40%);
  color: var(--ic-color-text-inverse, #fff);
}

.hero__ghost:hover {
  border-color: rgb(255 255 255 / 70%) !important;
  color: var(--ic-color-text-inverse, #fff) !important;
}

.hero__steps {
  display: flex;
  align-items: stretch;
  gap: var(--ic-spacing-6, 24px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 6px;
  width: 148px;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: rgb(255 255 255 / 4%);
}

.step:not(:last-child)::after {
  position: absolute;
  top: 50%;
  right: -19px;
  color: rgb(255 255 255 / 35%);
  content: '→';
  transform: translateY(-50%);
}

.step__icon {
  display: inline-flex;
  width: 30px;
  height: 30px;
  margin-bottom: 6px;
  color: #a7f04a;
}

.step__icon svg {
  width: 100%;
  height: 100%;
}

.step__title {
  color: var(--ic-color-text-inverse, #fff);
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.step__desc {
  color: #a9c3b2;
  font-size: var(--ic-font-size-xs, 12px);
  line-height: 1.5;
}

/* 通用卡片 */
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
  margin-bottom: var(--ic-spacing-5, 20px);
}

.card__title {
  margin: 0;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-lg, 18px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.card__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

/* 概览栅格 */
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--ic-spacing-6, 24px);
  align-items: start;
}

.works-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ic-spacing-4, 16px);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-page, #f8fafc);
}

.stat__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.stat__label svg {
  width: 16px;
  height: 16px;
  color: var(--ic-color-brand-500, #2563eb);
}

.stat__value {
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-4xl, 36px);
  font-weight: var(--ic-font-weight-semibold, 600);
  line-height: 1;
}

.works-card__latest {
  margin-top: var(--ic-spacing-4, 16px);
  padding: 16px 20px;
  border-radius: var(--ic-border-radius-lg, 12px);
  background: #fdf3e0;
}

.latest__label {
  display: block;
  margin-bottom: 10px;
  color: var(--ic-semantic-warning, #d97706);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.latest__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ic-spacing-3, 12px);
}

.latest__tag {
  padding: 4px 10px;
  border-radius: var(--ic-border-radius-full, 9999px);
  background: rgb(255 255 255 / 70%);
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-xs, 12px);
}

.latest__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ic-semantic-warning, #d97706);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
  cursor: pointer;
}

.latest__link:hover {
  text-decoration: underline;
}

.latest__empty {
  margin: 0;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

/* 积分卡 */
.points-card__icon {
  display: inline-flex;
  width: 26px;
  height: 26px;
  color: var(--ic-color-brand-500, #2563eb);
}

.points-card__icon svg {
  width: 100%;
  height: 100%;
}

.points-card__value {
  display: block;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: 48px;
  font-weight: var(--ic-font-weight-semibold, 600);
  line-height: 1;
}

.points-card__current {
  margin: 8px 0 20px;
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-sm, 14px);
}

.points-card__rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 20px;
  padding: 16px 0;
  border-block: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.points-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-card__row dt {
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.points-card__row dd {
  margin: 0;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.points-card__cta {
  width: 100%;
}

/* 分享区 */
.share-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ic-spacing-4, 16px);
}

.share-card__title {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-lg, 18px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.share-card__badge {
  padding: 3px 10px;
  border-radius: var(--ic-border-radius-full, 9999px);
  background: #fdf3e0;
  color: var(--ic-semantic-warning, #d97706);
  font-size: var(--ic-font-size-xs, 12px);
  font-weight: var(--ic-font-weight-medium, 500);
}

.share-card__desc {
  margin: 8px 0 0;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.share-card__assure {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-5, 20px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.share-card__assure li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ic-color-text-secondary, #475569);
  font-size: var(--ic-font-size-sm, 14px);
}

.share-card__assure svg {
  width: 18px;
  height: 18px;
  color: var(--ic-semantic-warning, #d97706);
}

.share-card__label {
  margin: var(--ic-spacing-6, 24px) 0 0;
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

/* 响应式 */
@media (max-width: 1023px) {
  .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .hero {
    padding: var(--ic-spacing-6, 24px);
  }

  .hero__title {
    font-size: var(--ic-font-size-3xl, 30px);
  }

  .hero__steps {
    flex-direction: column;
    width: 100%;
    gap: var(--ic-spacing-4, 16px);
  }

  .step {
    width: 100%;
  }

  .step:not(:last-child)::after {
    display: none;
  }

  .works-card__stats {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
