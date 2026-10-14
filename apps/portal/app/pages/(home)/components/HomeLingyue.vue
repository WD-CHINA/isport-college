<script setup lang="ts">
import { ACADEMY_CAPABILITIES } from '~/config/capabilities'
const { t } = useI18n()
const tools = computed(() => [
  { title: t('lingyue.lesson'), icon: '9cb0e.svg' },
  { title: t('lingyue.unit'), icon: 'c11d4.svg' },
  { title: t('lingyue.exercise'), icon: 'c9968.svg' },
  { title: t('lingyue.assessment'), icon: '0bb5a.svg' },
])
</script>
<template>
  <section class="home-lingyue learning-entries">
    <div class="container-page">
      <div class="home-lingyue__panel">
        <header class="home-lingyue__heading">
          <h2>{{ t('home.lingyueTitle') }}</h2>
          <p>{{ t('home.lingyueSubtitle') }}</p>
          <small v-if="!ACADEMY_CAPABILITIES.lingyue.enabled">{{ t('academy.unavailable') }}</small>
        </header>
        <ul class="home-lingyue__tools learning-entries__tools">
          <li v-for="tool in tools" :key="tool.icon">
            <button
              type="button"
              :disabled="!ACADEMY_CAPABILITIES.lingyue.enabled"
              :title="t('academy.unavailable')"
            >
              <span class="home-lingyue__icon"
                ><img :src="`/home/figma/${tool.icon}`" alt=""
              /></span>
              <strong>{{ tool.title }}</strong>
              <img src="/home/figma/6303a.svg" alt="" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
<style scoped>
.home-lingyue {
  padding: 36px 0;
}

.home-lingyue__panel {
  position: relative;
  display: flex;
  min-height: 133px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 36px;
  border-radius: 12px;
  background: #eaf5ff url('/home/figma/df637.png') center / cover no-repeat;
}

.home-lingyue__heading {
  flex: 0 1 250px;
}

.home-lingyue h2 {
  margin: 0;
  background: linear-gradient(145deg, #0079ff 4.2%, #a348f3 22.85%);
  background-clip: text;
  color: transparent;
  font-size: 28px;
  font-weight: 600;
  line-height: 45px;
}

.home-lingyue p {
  margin: 6px 0 0;
  color: rgb(28 31 35 / 60%);
  font-size: 14px;
  line-height: 22px;
}

.home-lingyue small {
  position: absolute;
  bottom: 4px;
  left: 36px;
  line-height: 16px;
  color: var(--home-color-muted);
  font-size: 12px;
}

.home-lingyue__tools {
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-lingyue button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 61px;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: var(--home-color-text);
  cursor: not-allowed;
}

.home-lingyue__icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: none;
  place-items: center;
}

.home-lingyue img {
  display: block;
  flex: none;
}

.home-lingyue strong {
  font-size: 18px;
  font-weight: 500;
  line-height: 45px;
  white-space: nowrap;
}

@media (max-width: 1199px) {
  .home-lingyue__panel {
    flex-direction: column;
    align-items: stretch;
  }

  .home-lingyue small {
    position: static;
    display: block;
    margin-top: 8px;
  }

  .home-lingyue__heading {
    flex-basis: auto;
  }

  .home-lingyue__tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-lingyue button {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .home-lingyue__panel {
    padding: 24px 16px;
  }

  .home-lingyue__tools {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
