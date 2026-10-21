# 部署指南

业务配置在构建时从 `apps/portal/.env.*` 读取并写入产物。服务器只部署对应环境的包，直接启动 Node 或 PM2，无需设置 `NUXT_*`，也无需复制 `.env` 文件。

## 按环境构建

使用 Node 24.11 或更高的 Node 24、pnpm 10.33.0，在仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm build:test
pnpm build:staging
pnpm build:prod
```

按需要执行其中一条构建命令即可，`pnpm build` 默认构建生产包。

| 环境     | 配置文件                       | 构建命令             | 部署目录           | 压缩包                                  |
| -------- | ------------------------------ | -------------------- | ------------------ | --------------------------------------- |
| 本地开发 | `apps/portal/.env.development` | `pnpm dev`           | —                  | —                                       |
| 测试     | `apps/portal/.env.test`        | `pnpm build:test`    | `dist/test/`       | `dist/isport-academy-test.tar.gz`       |
| 预发布   | `apps/portal/.env.staging`     | `pnpm build:staging` | `dist/staging/`    | `dist/isport-academy-staging.tar.gz`    |
| 生产     | `apps/portal/.env.production`  | `pnpm build:prod`    | `dist/production/` | `dist/isport-academy-production.tar.gz` |

不同环境的最终产物分别保存，构建另一环境不会删除已有部署包。`apps/portal/.output` 是最近一次构建的中间产物。不要并行构建多个环境。

所有部署包均为优化后的生产构建；业务环境由 `NUXT_PUBLIC_SITE_ENV` 区分，测试和预发布包保持全站禁止收录。

环境文件包括：

- `NUXT_API_BASE`：SSR 固定后端地址。测试、预发布为 `https://yuntiyu-test2.dream-sports.cn/academy`，生产为 `https://academy.dream-sports.cn/academy`。
- `NUXT_PUBLIC_API_BASE=/`：浏览器请求当前站点 `/api/v1/...`，由 Nginx 转发后端。
- `NUXT_PUBLIC_SITE_ENV`：分别为 `development`、`test`、`staging`、`production`。
- `NUXT_PUBLIC_DOCUMENT_PREVIEW_BASE`：文档预览服务地址，目前统一使用正式域名的 `/viewer/`。

修改环境文件后需重新构建。Nuxt 保留原生运行时覆盖能力，自动化 E2E 可用它连接独立测试协议服务器；日常部署使用包内配置。请勿在构建终端或 PM2 中遗留同名 `NUXT_*`，否则会覆盖文件值或包内默认配置。

## 上传与启动

以测试环境为例，把对应压缩包上传到服务器：

```bash
scp dist/isport-academy-test.tar.gz root@<ECS公网IP>:/data/isport-test2/
```

服务器仅需 Node 24 和 PM2，不安装 pnpm、不拉取仓库。首次从旧的运行时注入方案迁移时，删除并重建旧进程，清除 PM2 已保存的 `NUXT_*` 变量：

```bash
pm2 delete isport-academy || true
mkdir -p /data/isport-test2/web/isport-academy
tar -xzf /data/isport-test2/isport-academy-test.tar.gz -C /data/isport-test2/web/isport-academy
cd /data/isport-test2/web/isport-academy
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs isport-academy --lines 20 --nostream
```

预发布和生产分别解压 `isport-academy-staging.tar.gz`、`isport-academy-production.tar.gz` 到实际部署目录，启动命令相同。PM2 不再使用 `--env test` 或 `--env production` 选择业务环境。

解压后有 `server/index.mjs`、`public/`、`ecosystem.config.cjs`、`build-info.json`。`build-info.json` 标记实际构建环境，不包含 `.env` 内容。构建会展开服务端依赖软链，部署目录可以独立运行。

PM2 使用 `cwd: __dirname`，自动以配置文件所在目录启动。进程默认监听 `127.0.0.1:8040`，配置只包含 Node 运行模式、监听地址、端口等进程参数。也可直接执行：

```bash
node server/index.mjs
```

再次发布同一环境时，上传新包、解压后执行 `pm2 restart isport-academy`。依赖结构变化时建议清理旧部署目录再解压，避免留下旧文件。更换环境必须换成该环境的包。

## Nginx 与请求路径

生产前端和后端共用 `https://academy.dream-sports.cn`。生产 SSR 请求 `https://academy.dream-sports.cn/academy/api/v1/...`；浏览器接口仍为 `https://academy.dream-sports.cn/api/v1/...`，由 Nginx 转发。测试和预发布的 SSR 同样使用各自 `.env` 中带 `/academy` 的固定后端地址。

```text
浏览器 /、/en、/resources… → Nginx → 127.0.0.1:8040 Nuxt
浏览器 /api/v1/…         → Nginx → 127.0.0.1:8090 学苑后端
Nuxt SSR                → 所选 .env 中的 NUXT_API_BASE/api/v1/…
```

保留现有 Nginx 转发：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://127.0.0.1:8040;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

`/api/` 的 `proxy_pass` 不加尾部斜杠，以保留 `/api`。已有 `/academy/` 转发继续保持，不新增 `/statics/`。如负载均衡已终结 TLS，应确保上游能收到实际 HTTPS 协议。`8040` 和 `8090` 不对外放行。

## 验收与 SEO

构建三种环境后，运行 `node scripts/verify-build-environments.mjs`：分别解压部署包，清除测试进程的 `NUXT_*` 变量，验证独立启动、真实后端 SSR、浏览器公开配置及收录策略。

生产包允许公开页面收录，`robots.txt` 声明 `https://academy.dream-sports.cn/sitemap.xml`。`@nuxtjs/sitemap` 从匿名公开内容接口分页生成地图，缓存 5 分钟，排除账号、后台、创作和外链；上游不可用时返回 503。测试及预发布包禁止抓取与收录，地图返回 404。

前置 Nginx/CDN 如另行添加了公开页面的 `X-Robots-Tag: noindex`，需移除并清理缓存。上线后用站点所有者账号向百度搜索资源平台、Google Search Console 提交地图。

`node scripts/verify-seo.mjs` 可继续检查最新 `.output` 的详情元信息、结构化数据和浏览器导航；该检查为覆盖分支会临时覆盖运行配置，不代表部署需要注入变量。
