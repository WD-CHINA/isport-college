import { defineConfig } from '@isport/eslint-config'

/**
 * 工作区唯一 ESLint 配置。
 * 所有应用与包向上查找并复用该配置，避免多份配置漂移与 TSConfig 根目录歧义。
 */
export default defineConfig({ vue: true, tsconfigRootDir: import.meta.dirname })
