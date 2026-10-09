import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
  define: { 'import.meta.server': true, 'import.meta.client': false },
  test: {
    include: ['test/**/*.test.ts'],
  },
})
