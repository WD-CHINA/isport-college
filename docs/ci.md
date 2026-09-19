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
