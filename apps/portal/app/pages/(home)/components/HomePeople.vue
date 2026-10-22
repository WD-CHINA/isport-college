<script setup lang="ts">
import type { WebTeacher } from '@isport/shared'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'
import HomePersonCard from './HomePersonCard.vue'

const props = defineProps<{ people: WebTeacher[] }>()
const { t } = useI18n()
const openedStory = shallowRef<number | null>(null)
function setStory(id: number, expanded: boolean) {
  if (expanded) openedStory.value = id
  else if (openedStory.value === id) openedStory.value = null
}
watch(
  () => props.people,
  people => {
    if (!people.some(person => person.id === openedStory.value && person.story?.trim()))
      openedStory.value = null
  },
)
</script>

<template>
  <section class="home-people">
    <div class="container-page">
      <HomeSectionTitle :title="t('home.teachersTitle')" :subtitle="t('home.teachersSubtitle')" />
      <HomeCarousel
        v-if="people.length"
        class="home-people__carousel"
        :items="people"
        :item-key="person => person.id"
        :label="t('home.teachersTitle')"
        :desktop-slides="3"
        :autoplay="openedStory === null"
        @change="openedStory = null"
      >
        <template #default="{ item: person, index }">
          <HomePersonCard
            :person="person"
            :index="index"
            :expanded="openedStory === person.id"
            @update:expanded="setStory(person.id, $event)"
          />
        </template>
      </HomeCarousel>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-people {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__carousel {
    margin-top: 36px;
  }
}

@media (max-width: 767px) {
  .home-people__carousel {
    margin-top: 20px;
  }
}
</style>
