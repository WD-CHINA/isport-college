<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="learning-entries">
    <h2>{{ t('catalog.byLevel') }}</h2>
    <div class="learning-entries__levels">
      <NuxtLink
        v-for="level in 5"
        :key="level"
        :to="localePath({ path: '/resources', query: { level } })"
      >
        <span>{{ String(level).padStart(2, '0') }}</span
        >{{ t('catalog.levelValue', { level }) }} →
      </NuxtLink>
    </div>
    <h2>{{ t('lingyue.tools') }}</h2>
    <div class="learning-entries__tools">
      <LingyueButton
        v-for="tool in ['lesson', 'unit', 'exercise', 'assessment']"
        :key="tool"
        :label="t(`lingyue.${tool}`)"
      />
    </div>
  </section>
</template>

<style scoped>
.learning-entries {
  display: grid;
  gap: 20px;
}

.learning-entries h2 {
  margin: 0;
  font-size: 24px;
}

.learning-entries__levels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.learning-entries__levels a {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: #eef4ff;
  color: #1e40af;
}

.learning-entries__levels span {
  font-size: 28px;
  font-weight: 700;
  color: #8bb1f8;
}

.learning-entries__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
