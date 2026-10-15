<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const items = computed(() => [
  {
    title: t('home.capabilityDesign'),
    desc: t('home.capabilityDesignDesc'),
    to: localePath('/resources'),
    icon: 'eb337.svg',
  },
  {
    title: t('home.capabilityPractice'),
    desc: t('home.capabilityPracticeDesc'),
    to: localePath('/schools'),
    icon: 'a8f62.svg',
  },
  {
    title: t('home.capabilityStudy'),
    desc: t('home.capabilityStudyDesc'),
    to: localePath('/research'),
    icon: 'd91b1.svg',
  },
  {
    title: t('home.capabilityExpert'),
    desc: t('home.capabilityExpertDesc'),
    to: localePath('/teachers'),
    icon: 'cf724.svg',
  },
])
</script>

<template>
  <section class="home-capabilities">
    <div class="container-page">
      <ul>
        <li v-for="item in items" :key="item.icon">
          <NuxtLink :to="item.to">
            <span class="home-capabilities__icon" aria-hidden="true">
              <img :src="`/home/figma/${item.icon}`" alt="" />
            </span>
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.desc }}</small>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-capabilities {
  position: relative;
  z-index: 1;
  margin-top: -64px;
  padding-bottom: 36px;
  background: linear-gradient(transparent 64px, var(--ic-color-academy-background-page) 64px);

  ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin: 0;
    padding: 36px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
    list-style: none;
  }

  a {
    display: flex;
    align-items: center;
    gap: 20px;
    min-width: 0;
    color: var(--ic-color-academy-text-primary);
  }

  &__icon {
    display: grid;
    width: 60px;
    height: 60px;
    flex: none;
    place-items: center;
    border-radius: 6px;
    background: var(--ic-color-academy-tint);
    color: #3295fb;

    img {
      display: block;
    }
  }

  & strong,
  & small {
    display: block;
  }

  strong {
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;
  }

  small {
    margin-top: 6px;
    color: var(--ic-color-academy-text-secondary);
    font-size: 13px;
    line-height: 20px;
  }
}

@media (max-width: 900px) {
  .home-capabilities {
    ul {
      grid-template-columns: 1fr 1fr;
    }
  }
}

@media (max-width: 767px) {
  .home-capabilities {
    margin-top: -48px;
    padding-bottom: 16px;
    background: linear-gradient(transparent 48px, var(--ic-color-academy-background-page) 48px);

    ul {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px 16px;
      padding: 20px 16px;
    }

    a {
      align-items: flex-start;
      gap: 10px;
    }

    a > span:last-child {
      min-width: 0;
    }

    &__icon {
      width: 36px;
      height: 36px;

      img {
        width: 28px;
        height: 28px;
      }
    }

    strong {
      font-size: 14px;
      line-height: 20px;
      overflow-wrap: anywhere;
    }

    small {
      margin-top: 4px;
      font-size: 11px;
      line-height: 17px;
    }
  }
}
</style>
