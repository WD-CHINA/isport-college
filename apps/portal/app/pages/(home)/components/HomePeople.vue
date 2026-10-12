<script setup lang="ts">
import { isContentAssetUrl, type WebTeacher } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

defineProps<{ title: string; people: WebTeacher[]; to: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
</script>

<template>
  <section class="home-people">
    <div class="home-people__heading">
      <h2>{{ title }}</h2>
      <NuxtLink :to="localePath(to)">{{ t('common.viewMore') }} →</NuxtLink>
    </div>
    <ul v-if="people.length" class="home-people__list">
      <li v-for="person in people" :key="person.id">
        <NuxtLink :to="localePath(`/teachers/${person.id}`)" class="home-people__card">
          <img
            v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
            :src="apiUrl(person.avatarUrl)"
            alt=""
            width="72"
            height="72"
          />
          <span v-else class="home-people__fallback" aria-hidden="true">{{
            person.name.slice(0, 1)
          }}</span>
          <strong>{{ person.name }}</strong>
          <span>{{ person.honorTitle || person.jobTitle }}</span>
          <span>{{ person.schoolOrg }}</span>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="home-people__empty">{{ t('catalog.noResults') }}</p>
  </section>
</template>

<style scoped>
.home-people {
  display: grid;
  gap: 20px;
}

.home-people__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-people__heading h2 {
  margin: 0;
  font-size: 24px;
}

.home-people__heading a {
  color: var(--ic-color-brand-500);
}

.home-people__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-people__card {
  display: grid;
  gap: 4px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: inherit;
  background: #fff;
}

.home-people__card img,
.home-people__fallback {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.home-people__fallback {
  display: grid;
  place-items: center;
  background: var(--ic-color-brand-100);
  color: var(--ic-color-brand-600);
  font-size: 24px;
}

.home-people__empty {
  margin: 0;
  color: #64748b;
}
</style>
