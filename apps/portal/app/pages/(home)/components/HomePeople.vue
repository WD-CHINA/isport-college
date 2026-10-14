<script setup lang="ts">
import { isContentAssetUrl, type WebTeacher } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{ people: WebTeacher[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const page = shallowRef(0)
const pages = computed(() => Math.max(1, Math.ceil(props.people.length / 3)))
const visible = computed(() => props.people.slice(page.value * 3, page.value * 3 + 3))

watch(
  () => props.people.length,
  () => {
    page.value = 0
  },
)
</script>

<template>
  <section class="home-people">
    <div class="container-page">
      <HomeSectionTitle :title="t('home.teachersTitle')" :subtitle="t('home.teachersSubtitle')" />
      <ul>
        <li v-for="(person, row) in visible" :key="person.id">
          <NuxtLink :to="localePath(`/teachers/${person.id}`)">
            <div class="home-people__quote">
              <img :src="`/home/figma/${row === 2 ? '3f802.svg' : '5f87f.svg'}`" alt="" />
              <p>{{ person.story || person.honorTitle }}</p>
            </div>
            <span class="home-people__divider"><img src="/home/figma/e84bd.svg" alt="" /></span>
            <span class="home-people__who">
              <img
                v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
                :src="apiUrl(person.avatarUrl)"
                alt=""
              />
              <i v-else aria-hidden="true" />
              <span>
                <strong>{{ person.name }}</strong>
                <em v-if="person.jobTitle || person.honorTitle">{{
                  person.honorTitle || person.jobTitle
                }}</em>
                <small>{{ person.schoolOrg }}</small>
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
      <div v-if="pages > 1" class="home-people__dots">
        <button
          v-for="dot in pages"
          :key="dot"
          type="button"
          :class="{ 'is-active': dot - 1 === page }"
          :aria-label="String(dot)"
          @click="page = dot - 1"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-people {
  padding: 48px 0;
  background: #fbfdff;

  ul {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    margin: 36px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    min-width: 0;
  }

  a {
    display: flex;
    min-height: 244px;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px;
    border-radius: 12px;
    background: #edf3ff;
    color: #1c1f23;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
  }

  &__quote {
    display: grid;
    gap: 12px;

    img {
      width: auto;
      height: auto;
      border-radius: 0;
      background: none;
    }
  }

  &__divider {
    display: block;
    overflow: hidden;
    margin-top: 24px;

    img {
      display: block;
    }
  }

  &__who {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 24px;

    & img,
    & i {
      width: 48px;
      height: 48px;
      flex: none;
      border-radius: 50%;
      background: #68788c;
      object-fit: cover;
    }
  }

  strong {
    display: inline;
    font-size: 16px;
    font-weight: 500;
  }

  small {
    display: block;
  }

  em {
    display: inline-block;
    margin: 0 0 6px 12px;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgb(0 149 238 / 15%);
    color: #004b83;
    font-size: 12px;
    font-style: normal;
  }

  small {
    color: #68788c;
    font-size: 12px;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 36px;

    button {
      width: 8px;
      height: 8px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: #cbe7fe;
    }

    .is-active {
      width: 16px;
      background: #0077fa;
    }
  }
}

@media (max-width: 900px) {
  .home-people {
    ul {
      grid-template-columns: 1fr;
    }
  }
}
</style>
