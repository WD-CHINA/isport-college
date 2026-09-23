import { randomUUID } from 'node:crypto'
import { defineConfig } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3100)
const controlKey = (process.env.ACADEMY_TEST_CONTROL_KEY ??= randomUUID())
const useBuiltOutput = process.env.E2E_USE_BUILT_OUTPUT === 'true'
const buildPrefix = useBuiltOutput ? '' : 'pnpm build && '

/**
 * E2E 基于生产构建产物运行，验证真实 SSR/CSR 与响应头行为。
 * 业务请求使用应用内同源 Mock；每个用例通过受控 Cookie 隔离命名空间。
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
      command: `sh -c "${buildPrefix}PORT=${port} node .output/server/index.mjs"`,
      env: {
        NUXT_PUBLIC_SITE_ENV: 'test',
        NUXT_DATA_SOURCE: 'mock',
        NUXT_PRODUCT_PHASE: process.env.E2E_PHASE ?? 'p0',
        NUXT_MOCK_CONTROLS_ENABLED: 'true',
        NUXT_MOCK_CONTROL_KEY: controlKey,
      },
      port,
      timeout: 300_000,
      reuseExistingServer: false,
    },
  ],
})
