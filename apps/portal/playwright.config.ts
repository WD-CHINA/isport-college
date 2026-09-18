import { defineConfig } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3100)
const useBuiltOutput = process.env.E2E_USE_BUILT_OUTPUT === 'true'
const buildPrefix = useBuiltOutput ? '' : 'pnpm build && '

/** E2E 基于生产构建产物运行，验证真实 SSR/CSR 与响应头行为 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: `sh -c "${buildPrefix}NUXT_PUBLIC_SITE_ENV=test PORT=${port} node .output/server/index.mjs"`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
