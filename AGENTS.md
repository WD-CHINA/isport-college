# Repository Guidelines（仓库指南）

## 项目结构与模块划分

本项目是 pnpm + Turborepo Monorepo。`apps/portal` 是 Nuxt 4 应用：页面、布局、状态和组件位于 `app/`，Nitro 处理器位于 `server/`，静态资源位于 `public/`，Playwright 用例位于 `e2e/`。

通用能力放在 `packages/`：`ui-core` 和 `ui-admin` 提供 Vue 组件，`design-tokens` 生成主题资源，`shared` 仅存放平台无关的 TypeScript。前台请求放在 `apps/portal/app/api`：`request.ts` 只负责地址、鉴权头、语言头和 `{status,message,data}` 信封；`academy.ts` 只声明学苑路径和参数。响应校验放在调用侧 `utils/academy-data.ts`、`web-response.ts` 和资料整理函数中。`useAcademy()` 在 setup 中为当前请求创建客户端，并显式绑定当前 Nuxt 的 Pinia；SSR 与浏览器统一使用标准 fetch，只发送当前会话的 Bearer，不继承入站 Cookie/Authorization。新增模块前先确认 `docs/architecture.md` 中的职责与依赖方向。

## 架构边界（强制）

工作区采用由上到下的单向依赖，箭头表示允许方向：

```text
portal -> ui-admin -> ui-core -> design-tokens / shared
portal -> rich-text -> ui-core / design-tokens / shared
portal -> shared
portal -> i18n -> shared
portal -> unocss-preset -> design-tokens
```

- `apps/portal` 是唯一应用和部署边界；任何 `packages/*` 都不得反向依赖它，也不得导入 `~/`、`@/`、`#app` 等应用私有别名。
- 包之间只能通过目标包 `package.json` 的 `exports` 导入，禁止跨包读取 `src`。依赖必须声明在实际使用它的 workspace 中，根目录不能为业务依赖兜底。
- `shared` 只包含领域类型、常量和纯函数；`design-tokens` 只包含平台无关令牌。两者不得引入 Vue、Nuxt、Pinia、antdv-next 或应用状态。
- `ui-core`、`ui-admin`、`rich-text` 只负责展示与交互，不得发起业务请求、访问 Portal store 或承载路由逻辑。
- 每个页面目录都必须包含路由入口 `*.vue`，业务组件放在同级 `components`，状态放在同级 `composables`。不允许只有组件、没有入口页的目录。首页入口是 `pages/(home)/index.vue`，地址为 `/`。资源列表、详情和媒体放在 `pages/resources`；教研和校本入口复用这些文件。导航、登录和通用分页留在 `components/app` 与 `components/auth`。跨页面的内容卡片放在 `components/content`，页面不得引用其他页面目录里的组件。`useAcademy`、语言切换、焦点刷新和登录会话留在 `composables`。跨路由客户端状态放入 `stores`。`app/api` 只放请求与接口路径，不放字段校验和业务判断。实际接口鉴权由学苑后端负责；本应用的 `server` 负责启动检查、渲染与收录控制。
- 业务组件、store 与 composable 必须显式导入；Nuxt/Vue 内置 API 可自动导入。`auth` store 不负责接口、弹窗或导航；请求和资料更新必须防止旧响应覆盖新会话。公开 SSR 不等待 `/me`，推荐不得阻塞正文。
- 未接入能力由 `app/config/capabilities.ts` 声明，保留门禁和不可用页，不得恢复伪成功状态或无对应接口的表单。
- 前端菜单与路由统一调用 `auth.can(permission)`，但客户端判断不代替服务端授权。新增权限先在 `shared` 的权限模型中声明。
- 新能力若不符合现有层级，应提取到正确的下层包，不得通过深层导入、循环依赖或复制代码绕过边界。根 `eslint.config.mjs` 及 `packages/eslint-config/boundaries.mjs` 检查实际路径、exports、依赖、循环和展示包副作用，是强制门禁，修改后至少运行 `pnpm lint` 和相关类型检查。

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

`apps/portal` 的 `antdv-next` 组件由 `@antdv-next/nuxt` 自动注册，模板使用 `A` 前缀（如 `<AButton>`），不要再手写组件 import。`useBreakpoint`、`App.useApp()`、组件静态属性（如 `Empty.PRESENTED_IMAGE_DEFAULT`）和 `antdv-next/locale/*` 仍显式导入。`packages/*` 不经过该模块，展示包继续按组件显式导入。组件 API 以 `.agents/skills/antdv-next` 技能文档为准。根目录 `eslint.config.mjs` 是唯一 ESLint 入口，不得在包内新增配置。`shared` 禁止依赖 Vue、Nuxt、Pinia 或浏览器专属 API。

## 测试要求

包的单元测试放在各包 `test/` 目录；Portal 的接口单测放在 `apps/portal/test`。浏览器、SSR 和完整用户流程放在 `apps/portal/e2e`；Playwright 自动启动该目录的独立 `/api/v1` 协议服务器，不依赖内网接口，不在生产目录加入 mock。认证、路由、SSR、管理端和非生产环境 `noindex` 行为发生变化时，必须补充回归测试。当前没有全局覆盖率阈值，但应检查受影响包的覆盖率结果。

## 提交与合并请求

提交遵循 Conventional Commits，例如 `fix(portal): 修复预发环境收录配置`。可用类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`build`、`ci` 和 `chore`。

合并请求应说明修改范围与架构影响，关联对应事项，列出验证命令；可见 UI 变化需附截图。仅在令牌源发生变化时提交生成文件，避免混入无关重构。

## 配置与安全

依赖必须声明在实际使用它的包中，不得依赖根目录兜底解析。禁止提交密钥；运行时值通过 Nuxt Runtime Config 注入。非生产环境必须保持全站禁止搜索引擎收录。

## 参考文档

- `.agents/skills/antdv-next/`：`antdv-next` 组件库的技能文档，入口为 `SKILL.md`，组件文档、示例、主题 Token 与语义描述位于 `references/`。查询 `antdv-next` 组件 API 或处理弃用告警（如 `bordered` 改为 `variant`）时优先查阅此技能，不要凭记忆猜测 API。
