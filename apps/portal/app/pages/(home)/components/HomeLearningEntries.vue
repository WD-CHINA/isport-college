<script setup lang="ts">
import LingyueButton from './LingyueButton.vue'
defineProps<{ levels: { id: string; name: string }[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="learning-entries">
    <h2>{{ t('catalog.byLevel') }}</h2>
    <div class="learning-entries__levels">
      <NuxtLink
        v-for="level in levels"
        :key="level.id"
        :to="localePath({ path: '/resources', query: { recommendedLevel: level.id } })"
      >
        <span>{{ level.id.padStart(2, '0') }}</span
        >{{ level.name }} →
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
    <p>{{ t('academy.unavailable') }}</p>
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
  background: var(--ic-color-brand-50);
  color: var(--ic-color-brand-700);
}

.learning-entries__levels span {
  font-size: 28px;
  font-weight: 700;
  color: var(--ic-color-brand-400);
}

.learning-entries__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
