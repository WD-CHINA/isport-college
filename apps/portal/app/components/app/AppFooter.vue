<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
const links = computed(() => [
  { to: localePath('/'), label: t('footer.home') },
  { to: localePath('/resources'), label: t('academy.resources') },
  { to: localePath('/research'), label: t('nav.research') },
  { to: localePath('/schools'), label: t('academy.schools') },
  { to: localePath('/teachers'), label: t('academy.teachers') },
  { to: localePath('/news'), label: t('academy.news') },
  { to: localePath('/legal/terms'), label: t('academy.terms') },
  { to: localePath('/legal/privacy'), label: t('academy.privacy') },
])
</script>
<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <section class="app-footer__contact" :aria-label="t('footer.contact')">
        <NuxtLink class="app-footer__brand" :to="localePath('/')">
          <strong>{{ t('footer.brand') }}</strong>
          <small>DREAM SPORTS ACADEMY</small>
        </NuxtLink>
        <a class="app-footer__hotline" href="tel:4000660059">
          <span>{{ t('footer.hotline') }}</span>
          <strong>400-066-0059</strong>
        </a>
        <address class="app-footer__address">
          <p>{{ t('footer.company') }}</p>
          <p>{{ t('footer.address') }}</p>
          <p>
            {{ t('footer.email')
            }}<a href="mailto:business@dreamsports.ai">business@dreamsports.ai</a>
          </p>
        </address>
      </section>
      <nav class="app-footer__nav" :aria-label="t('footer.navigation')">
        <h2>{{ t('footer.navigation') }}</h2>
        <div class="app-footer__links">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
        </div>
      </nav>
      <div class="app-footer__social">
        <figure>
          <span class="app-footer__qr"
            ><img
              class="app-footer__qr--wechat"
              src="/home/figma/8422f.png"
              :alt="t('footer.wechatQr')"
          /></span>
          <figcaption>{{ t('footer.wechat') }}</figcaption>
        </figure>
        <figure>
          <span class="app-footer__qr"
            ><img
              class="app-footer__qr--video"
              src="/home/figma/dfccf.png"
              :alt="t('footer.videoQr')"
          /></span>
          <figcaption>{{ t('footer.video') }}</figcaption>
        </figure>
      </div>
    </div>
    <div class="app-footer__copy">© {{ year }} {{ t('footer.company') }}</div>
  </footer>
</template>
<style scoped>
.app-footer {
  padding-top: 15px;
  background: #fbfdff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.app-footer__inner {
  display: grid;
  width: min(100% - 48px, 1320px);
  grid-template-columns: minmax(0, 611.62fr) minmax(0, 376.38fr) 244px;
  gap: 44px;
  margin-inline: auto;
  padding: 50px 0 46px;
}

.app-footer__contact {
  min-width: 0;
  min-height: 223.086px;
  padding-right: 36px;
  border-right: 1px solid #e1e7ed;
}

.app-footer__brand {
  display: inline-flex;
  flex-direction: column;
  color: #1c1f23;
}

.app-footer__brand strong {
  font-size: 22px;
  font-weight: 600;
  line-height: 35px;
}

.app-footer__brand small {
  margin-top: 4px;
  color: #71808d;
  font-size: 8px;
  line-height: 8.8px;
  letter-spacing: 1.7px;
}

.app-footer__hotline {
  display: flex;
  min-height: 49px;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f4f7fb;
}

.app-footer__hotline span {
  color: #71808d;
  font-size: 12px;
}

.app-footer__hotline strong {
  color: #101f33;
  font-size: 21px;
  font-weight: 500;
  line-height: 25px;
  white-space: nowrap;
}

.app-footer__address {
  margin-top: 22px;
  color: #71808d;
  font-size: 11px;
  font-style: normal;
  line-height: 21px;
  overflow-wrap: anywhere;
}

.app-footer__address p {
  margin: 7px 0 0;
}

.app-footer__address p:first-child {
  margin-top: 0;
}

.app-footer__address a {
  color: inherit;
}

.app-footer__nav {
  padding-top: 4px;
}

.app-footer__nav h2 {
  margin: 0;
  padding-bottom: 18px;
  border-bottom: 1px solid #e1e7ed;
  color: #101f33;
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
}

.app-footer__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 20px;
  margin-top: 24px;
}

.app-footer__links a {
  color: #71808d;
  font-size: 11px;
  line-height: 15px;
}

.app-footer__links a:hover,
.app-footer__address a:hover {
  color: #0077fa;
}

.app-footer__social {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding-top: 28px;
}

.app-footer__social figure {
  width: 110px;
  margin: 0;
}

.app-footer__qr {
  position: relative;
  display: block;
  overflow: hidden;
  width: 110px;
  height: 110px;
  background: #fff;
}

.app-footer__qr img {
  position: absolute;
  display: block;
  max-width: none;
}

.app-footer__qr--wechat {
  top: -1.26%;
  left: -1.5%;
  width: 103%;
  height: 102.53%;
}

.app-footer__qr--video {
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-footer__social figcaption {
  margin-top: 12px;
  color: #71808d;
  font-size: 11px;
  line-height: 13px;
  text-align: center;
}

.app-footer__copy {
  padding: 18px 24px;
  border-top: 1px solid #e1e7ed;
  color: #8a97a4;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
}

@media (max-width: 1100px) {
  .app-footer__inner {
    grid-template-columns: minmax(0, 1fr) 244px;
    gap: 32px;
    padding-top: 32px;
  }

  .app-footer__contact {
    grid-column: 1 / -1;
    min-height: 0;
    padding: 0 0 24px;
    border-right: 0;
    border-bottom: 1px solid #e1e7ed;
  }
}

@media (max-width: 560px) {
  .app-footer__inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .app-footer__social {
    justify-content: center;
    padding-top: 0;
  }

  .app-footer__brand strong {
    font-size: 20px;
  }
}
</style>
