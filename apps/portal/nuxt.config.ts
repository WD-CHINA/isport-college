import { LOCALE_COOKIE_NAME, LOCALE_URL_CODES, LOCALE_URL_PREFIXES } from '@isport/shared'
import { DEFAULT_DOCUMENT_PREVIEW_BASE } from './app/utils/document-preview'

/**
 * 管理端只做 CSR：不直出页面内容。
 * 禁止收录的响应头由 `server/middleware/academy-gate.ts` 按归一化路径统一输出，
 * 否则大小写变体（/Admin/...）会绕过这里的字面路径规则。
 */
const adminRouteRules = Object.fromEntries(
  ['/admin', ...LOCALE_URL_PREFIXES.map(prefix => `/${prefix}/admin`)].flatMap(base => [
    [base, { ssr: false }],
    [`${base}/**`, { ssr: false }],
  ]),
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',
  // 监听所有网卡，局域网设备可用本机 IP 打开开发服务。
  devServer: {
    host: '0.0.0.0',
  },
  devtools: {
    enabled: false,
    timeline: {
      enabled: false,
    },
  },
  // 本地业务组件仍显式导入。空 dirs 让组件模块保持启用，@antdv-next/nuxt 才能把组件注册为 A 前缀。
  components: {
    dirs: [],
  },
  // 页面旁的 components / composables 只是同目录代码，不生成路由。
  pages: {
    pattern: ['**/*.vue', '!**/components/**', '!**/composables/**', '!**/utils/**'],
  },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/i18n',
    '@antdv-next/nuxt',
    'nuxt-swiper',
  ],
  // 打包并注册 Swiper 自定义元素；页面在客户端初始化轮播，正文保留 SSR。
  swiper: {
    enableComposables: true,
    bundled: true,
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
  css: ['normalize.css', '@isport/design-tokens/css-vars', '~/assets/css/main.scss'],
  nitro: {
    devProxy: {
      // h3 会去掉匹配前缀，因此把前缀放进 target，避免 /api/v1 变成 /v1。
      '/api': { target: `${process.env.NUXT_API_BASE}/api`, changeOrigin: true },
    },
    externals: {
      // vue-router 的 devtools 分块在运行时导入 @vue/devtools-api。
      // 外置复制不会带上 pnpm 里的间接依赖，服务器启动会 ERR_MODULE_NOT_FOUND。
      inline: ['vue-router', '@vue/devtools-api', '@vue/devtools-kit', '@vue/devtools-shared'],
    },
  },
  runtimeConfig: {
    /** SSR 的固定学苑上游；开发由 .env 注入，生产由部署环境注入。 */
    apiBase: process.env.NUXT_API_BASE ?? '',
    public: {
      /** 部署环境：非 production 环境全站禁止收录 */
      siteEnv: 'development',
      /**
       * 空或 `/`：浏览器请求当前站点。开发由 devProxy 转发 /api，生产由 Nginx 转发。
       * 绝对地址：浏览器直连。E2E 用来访问测试协议服务器，生产产物没有 devProxy。
       */
      apiBase: '',
      /**
       * 文档预览服务根地址；文件 URL 以 encode 后的 url 参数拼接。
       * 可用 NUXT_PUBLIC_DOCUMENT_PREVIEW_BASE 覆盖。
       */
      documentPreviewBase:
        process.env.NUXT_PUBLIC_DOCUMENT_PREVIEW_BASE ?? DEFAULT_DOCUMENT_PREVIEW_BASE,
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
    ...adminRouteRules,
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'zh',
    langDir: 'locales',
    // 语言码与数据语言码的对应关系以 @isport/shared 为准
    locales: [
      { code: 'zh', language: LOCALE_URL_CODES.zh, name: '简体中文', file: 'zh-CN.ts' },
      { code: 'en', language: LOCALE_URL_CODES.en, name: 'English', file: 'en-US.ts' },
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
    prefix: 'A',
  },
  imports: {
    // 业务 composable/store 使用显式导入；保留 Nuxt/Vue 内置自动导入。
    scan: false,
  },
  typescript: {
    // 类型检查由 pnpm typecheck（vue-tsc）独立执行，不阻塞开发构建
    typeCheck: false,
  },
})
