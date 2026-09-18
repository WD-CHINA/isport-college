import { defineConfig } from '@isport/eslint-config'

/**
 * 根目录 ESLint 配置（lint-staged 从仓库根执行 eslint 时使用）。
 * 采用 Vue 全量规则作为各子包配置的超集：非 Vue 文件不受影响，
 * portal 的 .vue 文件获得与子包内一致的检查规则。
 */
export default defineConfig({ vue: true, tsconfigRootDir: import.meta.dirname })
