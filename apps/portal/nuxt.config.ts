import { LOCALE_COOKIE_NAME } from '@isport/shared'

const adminNoIndex = {
  ssr: false,
  headers: {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  },
} as const

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',
  devtools: { enabled: false },
  components: [{ path: '~/components', pathPrefix: false }],
  modules: ['@pinia/nuxt', '@unocss/nuxt', '@nuxtjs/i18n'],
  css: ['normalize.css', '@isport/design-tokens/css-vars', '~/assets/css/main.scss'],
  runtimeConfig: {
    public: {
      /** 部署环境：非 production 环境全站禁止收录 */
      siteEnv: process.env.NUXT_PUBLIC_SITE_ENV ?? 'development',
      /** 未来真实 API Base URL，通过环境变量注入，不写死在源码中 */
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  routeRules: {
    '/admin': adminNoIndex,
    '/admin/**': adminNoIndex,
    '/en/admin': adminNoIndex,
    '/en/admin/**': adminNoIndex,
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'zh',
    langDir: 'locales',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh-CN.ts' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en-US.ts' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LOCALE_COOKIE_NAME,
      redirectOn: 'root',
      fallbackLocale: 'zh',
    },
  },
  build: {
    // antdv-next 及内部 @v-c/* 组件库在 Node ESM 下使用无扩展名导入，必须内联打包
    transpile: ['antdv-next', 'dayjs'],
  },
  nitro: {
    externals: {
      inline: [/^antdv-next/, /^@v-c\//, 'dayjs'],
    },
  },
  imports: {
    // 递归扫描 composables 子目录（course/admin 等）
    dirs: ['composables/**'],
  },
  typescript: {
    // 类型检查由 pnpm typecheck（vue-tsc）独立执行，不阻塞开发构建
    typeCheck: false,
  },
})
