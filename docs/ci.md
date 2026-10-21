# CI 检查流程

项目不绑定 GitHub Actions；任意 CI 平台使用同一入口，避免本地与流水线规则漂移。

## 运行环境

- Node.js 24.11 或更高的 Node 24 版本
- Corepack 启用的 pnpm 10.33.0
- Playwright Chromium 及其系统依赖

## 标准步骤

```bash
corepack enable
pnpm install --frozen-lockfile
# Playwright 只声明在 @isport/portal，需从该包调用 CLI
pnpm --filter @isport/portal exec playwright install --with-deps chromium
pnpm check:ci
```

`check:ci` 依次执行 ESLint、Stylelint、Prettier、TypeScript、单元测试、生产构建和关键 E2E。任何一步失败都会终止流程。

覆盖率是独立任务，不阻塞默认检查：

```bash
pnpm test:coverage
```

E2E 自动启动两个独立服务：3100 端口的 Nuxt 生产产物，以及 3200 端口的测试协议服务器。可用 `E2E_PORT` 和 `E2E_API_PORT` 更改端口。测试会自动将 API 地址指向测试服务器，不依赖内网学苑服务；不要复用已有服务或将测试服务器部署到生产环境。

测试启动时显式注入 `NUXT_API_BASE`（SSR 固定上游）和 `NUXT_PUBLIC_API_BASE`（浏览器直连测试协议服务器；生产产物没有开发代理）。部署包的默认配置来自构建命令选中的 `.env.test`、`.env.staging` 或 `.env.production`，服务器无需注入业务变量。E2E 的覆盖仅用于隔离测试协议服务器。SSR 始终使用固定后端，不从入站 Host 推导。

架构门禁包含相对路径越界、公开 exports、依赖声明、循环依赖及展示包副作用检查。对应规则测试通过 `pnpm test` 执行。Turbo 缓存包含根工程配置和架构规则，修改这些文件后不会沿用旧的 lint 结果。

环境构建使用 `pnpm build:test`、`pnpm build:staging`、`pnpm build:prod`，分别归档到 `dist/test`、`dist/staging`、`dist/production`。Turbo 将各环境 `.env` 文件纳入构建缓存。三种包全部生成后，可执行 `node scripts/verify-build-environments.mjs` 验证不注入业务变量的独立部署行为。
