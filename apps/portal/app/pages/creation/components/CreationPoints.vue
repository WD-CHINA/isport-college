<script setup lang="ts">
import { CREATION_DEMO_POINTS } from '../utils/creation-demo'

const emit = defineEmits<{ details: []; redeem: [] }>()
const { t } = useI18n()
</script>

<template>
  <section class="creation-points">
    <div class="creation-points__heading">
      <h2 class="creation-points__title">{{ t('creation.overview.pointsTitle') }}</h2>
      <button type="button" @click="emit('details')">
        {{ t('creation.overview.pointsDetails') }} <span aria-hidden="true">›</span>
      </button>
    </div>
    <div class="creation-points__balance">
      <p>{{ t('creation.pointsCard.current') }}</p>
      <strong>{{ CREATION_DEMO_POINTS.balance }}</strong>
    </div>
    <dl class="creation-points__summary">
      <div>
        <dt>{{ t('creation.pointsCard.monthGain') }}</dt>
        <dd>{{ CREATION_DEMO_POINTS.monthGain }}</dd>
      </div>
      <div>
        <dt>{{ t('creation.pointsCard.monthSpend') }}</dt>
        <dd>{{ CREATION_DEMO_POINTS.monthSpend }}</dd>
      </div>
    </dl>
    <button type="button" class="creation-points__redeem" @click="emit('redeem')">
      {{ t('creation.overview.redeem') }}
    </button>
  </section>
</template>

<style lang="scss" scoped>
.creation-points {
  display: flex;
  min-width: 0;
  min-height: 360px;
  flex-direction: column;
  padding: 23px;
  border: 1px solid rgb(28 31 35 / 10%);
  border-radius: 12px;
  background: #fff;

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 32px;
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    button {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgb(28 31 35 / 80%);
      font-size: 14px;
      cursor: pointer;

      span {
        font-size: 24px;
        line-height: 24px;
      }
    }
  }

  &__balance {
    margin-top: 24px;

    p {
      margin: 0 0 8px;
      color: rgb(28 31 35 / 60%);
      font-size: 14px;
      line-height: 32px;
    }

    strong {
      font-family: Arial, sans-serif;
      font-size: 48px;
      line-height: 48px;
    }
  }

  &__summary {
    display: grid;
    gap: 16px;
    margin: 24px 0;
    font-size: 14px;
    line-height: 20px;

    div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    dt {
      color: rgb(28 31 35 / 60%);
    }

    dd {
      margin: 0;
      font-family: Arial, sans-serif;
      font-size: 28px;
      font-weight: 700;
      line-height: 32px;
    }
  }

  &__redeem {
    width: 100%;
    min-height: 40px;
    margin-top: auto;
    padding: 8px 12px;
    border: 0;
    border-radius: 6px;
    background: rgb(46 50 56 / 5%);
    color: var(--ic-color-academy-primary, #0077fa);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>
