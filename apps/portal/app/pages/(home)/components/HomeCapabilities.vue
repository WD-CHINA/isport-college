<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const items = computed(() => [
  {
    title: t('home.capabilityDesign'),
    desc: t('home.capabilityDesignDesc'),
    to: localePath('/resources'),
    icon: 'design',
  },
  {
    title: t('home.capabilityPractice'),
    desc: t('home.capabilityPracticeDesc'),
    to: localePath('/schools'),
    icon: 'practice',
  },
  {
    title: t('home.capabilityStudy'),
    desc: t('home.capabilityStudyDesc'),
    to: localePath('/research'),
    icon: 'study',
  },
  {
    title: t('home.capabilityExpert'),
    desc: t('home.capabilityExpertDesc'),
    to: localePath('/teachers'),
    icon: 'expert',
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
              <svg v-if="item.icon === 'design'" viewBox="0 0 24 24">
                <path
                  d="M5 4h10l4 4v12H5V4z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M15 4v4h4M8 12h8M8 16h5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else-if="item.icon === 'practice'" viewBox="0 0 24 24">
                <path
                  d="M4 16l6-8 4 5 2-3 4 6H4z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else-if="item.icon === 'study'" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="7"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M6 19c1.2-3 3.2-4.5 6-4.5S16.8 16 18 19"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
              </svg>
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

<style scoped>
.home-capabilities {
  background: #fbfdff;
}

.home-capabilities ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
  padding: 36px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(28 31 35 / 6%);
  list-style: none;
}

.home-capabilities a {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  color: #1c1f23;
}

.home-capabilities__icon {
  display: grid;
  width: 60px;
  height: 60px;
  flex: none;
  place-items: center;
  border-radius: 6px;
  background: #eaf5ff;
  color: #3295fb;
}

.home-capabilities__icon svg {
  width: 28px;
  height: 28px;
}

.home-capabilities strong,
.home-capabilities small {
  display: block;
}

.home-capabilities strong {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.home-capabilities small {
  color: #1c1f23;
  font-size: 13px;
  line-height: 20px;
}

@media (max-width: 900px) {
  .home-capabilities ul {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-capabilities ul {
    grid-template-columns: 1fr;
  }
}
</style>
