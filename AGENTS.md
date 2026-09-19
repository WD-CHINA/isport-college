# Repository Guidelines（仓库指南）

## 项目结构与模块划分

本项目是 pnpm + Turborepo Monorepo。`apps/portal` 是 Nuxt 4 应用：页面、布局、状态和组件位于 `app/`，Nitro 处理器位于 `server/`，静态资源位于 `public/`，Playwright 用例位于 `e2e/`。

通用能力放在 `packages/`：`ui-core` 和 `ui-admin` 提供 Vue 组件，`api-client` 管理 Repository 接口与适配器，`mock-data` 保存测试数据，`design-tokens` 生成主题资源，`shared` 仅存放平台无关的 TypeScript。新增模块前先确认 `docs/architecture.md` 中的职责与依赖方向。

## 开发、构建与检查命令

使用 Node 24.11.x 和 pnpm 10.33.0。

- `pnpm dev`：启动工作区开发任务。
- `pnpm build`：生成设计令牌并构建 Nuxt 生产产物。
- `pnpm lint`、`pnpm lint:css`、`pnpm format:check`：执行 ESLint、Stylelint 和 Prettier 检查。
- `pnpm typecheck`：检查所有 TypeScript 与 Vue 包。
- `pnpm test`：运行 Vitest；`pnpm test:coverage`：单独生成覆盖率报告。
- `pnpm test:e2e`：运行 Playwright；`pnpm check`：执行完整本地质量门禁。
- CI 统一调用 `pnpm check:ci`，不要添加 GitHub Actions 工作流。

## 编码风格与命名

Prettier 统一使用两空格缩进、单引号、无分号、尾逗号和 100 字符行宽。Vue 使用 TypeScript、Composition API 和 `<script setup>`。组件使用 PascalCase，组合式函数命名为 `useFeatureName.ts`，测试文件使用 `*.test.ts` 或 `*.spec.ts`。

`antdv-next` 必须按组件显式导入，禁止全量注册，组件 API 以 `.agents/skills/antdv-next` 技能文档为准。根目录 `eslint.config.mjs` 是唯一 ESLint 入口，不得在包内新增配置。`shared` 禁止依赖 Vue、Nuxt、Pinia 或浏览器专属 API。

## 测试要求

单元测试与源码就近放置；浏览器、SSR 和完整用户流程放在 `apps/portal/e2e`。认证、路由、SSR、管理端和非生产环境 `noindex` 行为发生变化时，必须补充回归测试。当前没有全局覆盖率阈值，但应检查受影响包的覆盖率结果。

## 提交与合并请求

提交遵循 Conventional Commits，例如 `fix(portal): 修复预发环境收录配置`。可用类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`build`、`ci` 和 `chore`。

合并请求应说明修改范围与架构影响，关联对应事项，列出验证命令；可见 UI 变化需附截图。仅在令牌源发生变化时提交生成文件，避免混入无关重构。

## 配置与安全

依赖必须声明在实际使用它的包中，不得依赖根目录兜底解析。禁止提交密钥；运行时值通过 Nuxt Runtime Config 注入。非生产环境必须保持全站禁止搜索引擎收录。

## 参考文档

- `.agents/skills/antdv-next/`：`antdv-next` 组件库的技能文档，入口为 `SKILL.md`，组件文档、示例、主题 Token 与语义描述位于 `references/`。查询 `antdv-next` 组件 API 或处理弃用告警（如 `bordered` 改为 `variant`）时优先查阅此技能，不要凭记忆猜测 API。
