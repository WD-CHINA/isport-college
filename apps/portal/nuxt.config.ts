import { LOCALE_COOKIE_NAME } from '@isport/shared'

/** Mock 为默认数据源；真实接口必须显式配置，不自动连接测试服务。 */

const adminNoIndex = {
  ssr: false,
  headers: {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  },
} as const

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',
  devtools: { enabled: true },
  components: [{ path: '~/components', pathPrefix: false }],
  modules: ['@pinia/nuxt', '@unocss/nuxt', '@nuxtjs/i18n', '@antdv-next/nuxt'],
  css: ['normalize.css', '@isport/design-tokens/css-vars', '~/assets/css/main.scss'],
  runtimeConfig: {
    dataSource: 'mock',
    productPhase: 'p0',
    mock: { storageDir: '', controlsEnabled: false, controlKey: '' },
    apiBase: '',
    public: {
      /** 部署环境：非 production 环境全站禁止收录 */
      siteEnv: 'development',
      apiBase: '',
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
    '/api/academy/**': { headers: { 'Cache-Control': 'private, no-store' } },
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
    // 使用 Cookie 让 SSR 在首个请求阶段即可确定语言；仅根路径执行自动重定向，
    // 带语言前缀或具体业务路径的 URL 始终以路由为准。
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LOCALE_COOKIE_NAME,
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'zh',
    },
  },
  // antdv-next 的 SSR 集成（transpile/noExternal、组件注册、dayjs、cssinjs 样式提取）
  // 由官方模块 @antdv-next/nuxt 统一处理，无需手写 build.transpile / nitro.externals.inline。
  antd: {
    // 项目未使用 @antdv-next/icons 图标组件，不开启自动注册
    icon: false,
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
