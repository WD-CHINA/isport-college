<script setup lang="ts">
const { t } = useI18n()
// 设计稿提供的公开服务数据；作为品牌文案展示，不参与业务统计。
const stats = [
  { value: '43,000', unit: 'teachersUnit', label: 'teachers' },
  { value: '8,166', unit: 'schoolsUnit', label: 'schools' },
  { value: '627', unit: 'resourcesUnit', label: 'resources' },
  { value: '33', unit: 'regionsUnit', label: 'regions' },
]
</script>
<template>
  <section class="home-service-stats" :aria-label="t('home.serviceStats.title')">
    <dl class="home-service-stats__list">
      <div v-for="stat in stats" :key="stat.label">
        <dd>
          {{ stat.value }}<small>{{ t(`home.serviceStats.${stat.unit}`) }}</small>
        </dd>
        <dt>{{ t(`home.serviceStats.${stat.label}`) }}</dt>
      </div>
    </dl>
  </section>
</template>
<style lang="scss" scoped>
.home-service-stats {
  display: grid;
  min-height: 180px;
  place-items: center;
  background: var(--home-color-primary);
  color: #fff;

  &__list {
    display: grid;
    width: min(100% - 48px, 1288px);
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 30px;
    margin: 0;
    padding: 40px 0;
    text-align: center;
  }

  dd {
    margin: 0;
    font-size: 44px;
    font-weight: 600;
    line-height: 54px;
  }

  small {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 400;
    line-height: 14px;
  }

  dt {
    margin-top: 14px;
    font-size: 12px;
    line-height: 18px;
  }
}

@media (max-width: 700px) {
  .home-service-stats {
    &__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    dd {
      font-size: 32px;
      line-height: 44px;
    }
  }
}
</style>
