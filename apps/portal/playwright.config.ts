import { defineConfig } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3100)
const apiPort = Number(process.env.E2E_API_PORT ?? 3200)
const useBuiltOutput = process.env.E2E_USE_BUILT_OUTPUT === 'true'
const buildPrefix = useBuiltOutput ? '' : 'pnpm build && '

/**
 * E2E 基于生产构建产物运行，验证真实 SSR/CSR 与响应头行为。
 * 应用代码始终请求真实接口；测试环境由本地 e2e/api-server.mjs 充当后端，
 * SSR 与浏览器均通过 NUXT_(PUBLIC_)API_BASE 指向它（服务器已开 CORS）。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: [
    {
      command: 'node e2e/api-server.mjs',
      port: apiPort,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `sh -c "${buildPrefix}NUXT_PUBLIC_SITE_ENV=test NUXT_API_BASE=http://127.0.0.1:${apiPort} NUXT_PUBLIC_API_BASE=http://127.0.0.1:${apiPort} PORT=${port} node .output/server/index.mjs"`,
      port,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
