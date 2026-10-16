import { defineConfig } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3100)
const apiPort = Number(process.env.E2E_API_PORT ?? 3200)
const useBuiltOutput = process.env.E2E_USE_BUILT_OUTPUT === 'true'
const buildPrefix = useBuiltOutput ? '' : 'pnpm build && '

/**
 * E2E 基于生产构建产物运行，验证真实 SSR/CSR 与响应头行为。
 * 通过测试目录内的独立协议服务器验证外域 SSR/CSR 请求，避免依赖内网接口。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 4,
  retries: process.env.CI ? 1 : 0,
  use: {
    locale: 'zh-CN',
    baseURL: `http://localhost:${port}`,
  },
  webServer: [
    {
      command: 'node e2e/api-server.mjs',
      env: { E2E_API_PORT: String(apiPort) },
      port: apiPort,
      reuseExistingServer: false,
    },
    {
      command: `sh -c "${buildPrefix}PORT=${port} node .output/server/index.mjs"`,
      env: {
        NUXT_PUBLIC_SITE_ENV: 'test',
        NUXT_API_BASE: `http://127.0.0.1:${apiPort}`,
        // 生产产物没有 devProxy，浏览器需要直连测试协议服务器。
        NUXT_PUBLIC_API_BASE: `http://127.0.0.1:${apiPort}`,
      },
      port,
      timeout: 300_000,
      reuseExistingServer: false,
    },
  ],
})
