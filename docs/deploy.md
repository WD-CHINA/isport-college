# 测试环境部署

门户部署到 `https://yuntiyu-test2.dream-sports.cn`。本机构建 SSR 产物，只把 `apps/portal/.output` 上传到 ECS。服务器不拉取仓库，也不安装 pnpm。

## 请求边界

```text
浏览器 /、/en、/resources…
  → 现有 Nginx → 127.0.0.1:8040 Nuxt SSR

浏览器 /api/v1/…
  → 现有 Nginx → 127.0.0.1:8090 学苑后端

Nuxt 服务端渲染
  → 直接请求 NUXT_API_BASE（http://127.0.0.1:8090/api/v1/…）
```

`8040` 和 `8090` 只监听本机，安全组不放行。Nginx 只新增 `/api/`，不新增 `/statics/`。开发代理同样只转发 `/api`。

`NUXT_PUBLIC_API_BASE=/` 时，接口返回的 `/statics/...` 保持门户相对路径，会随 `location /` 进入 Nuxt，不会转到 8090。绝对地址由浏览器直接请求。已经指向 `https://yuntiyu-test2.dream-sports.cn/academy/statics/...` 的地址，由现有 `location /academy/` 转到 8090。

现有 `/academy/`、`/dashboard/`、`/cms/`、`/files/` 等保持不动。`location /` 目前是校本看板静态站，改为反代后，该站不再从域名根路径提供。`location /admin/` 仍指向 `8091`，比 `/` 更具体，学苑自己的 `/admin` 页面到不了 Nuxt。

## 本机构建并上传

```bash
pnpm install --frozen-lockfile
pnpm --filter @isport/portal build
test -f apps/portal/.output/server/index.mjs && test -f apps/portal/.output/ecosystem.config.cjs && echo OK
```

`apps/portal/.output/nitro.json` 的 `preset` 必须是 `node-server`。没有 `server/index.mjs` 的静态目录不能上传。构建会把模板 `apps/portal/ecosystem.config.cjs` 复制为 `apps/portal/.output/ecosystem.config.cjs`。

```bash
tar -czf isport-college.tar.gz -C apps/portal/.output .
scp isport-college.tar.gz root@<ECS公网IP>:/data/isport-test2/
```

服务器使用 Node 24.11 或更高的 24。运行依赖是 JavaScript，macOS 上打的包一般可以直接在 Linux 上跑。启动若报某个 `.node` 文件找不到，再改到 Linux 上构建。

## 服务器

只需 Node 24 和 PM2：

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm install -g pm2

mkdir -p /data/isport-test2/web/isport-college
tar -xzf /data/isport-test2/web/isport-college.tar.gz -C /data/isport-test2/web/isport-college
```

解压后应有 `server/index.mjs`、`public/` 和 `ecosystem.config.cjs`。该文件就是模板 `apps/portal/ecosystem.config.cjs`，服务器不必再手写：

```js
const runtime = {
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: '8040',
  NITRO_HOST: '127.0.0.1',
  NITRO_PORT: '8040',
  NUXT_API_BASE: 'http://127.0.0.1:8090',
  NUXT_PUBLIC_API_BASE: '/',
  NUXT_PUBLIC_SITE_ENV: 'test',
}

module.exports = {
  apps: [
    {
      name: 'isport-college',
      cwd: '/data/isport-test2/web/isport-college',
      script: './server/index.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: runtime,
      env_production: runtime,
    },
  ],
}
```

生产进程不读取 `.env.production`。`NUXT_API_BASE` 必须写在这里，缺失或不是 HTTP/HTTPS 地址时进程启动失败，不会监听端口。测试环境保持 `NUXT_PUBLIC_SITE_ENV=test`，全站不收录。

端口必须是字符串。Nitro 读取 `NITRO_PORT` 或 `PORT`，缺了就听 `3000`，此时访问 `8040` 会被拒绝。PM2 使用 `--env production` 时读取 `env_production`，两组变量保持相同。

```bash
cd /data/isport-test2/web/isport-college
pm2 delete isport-college
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
pm2 logs isport-college --lines 20 --nostream
curl -sI http://127.0.0.1:8040/ | head
curl -sI http://127.0.0.1:8090/api/v1/home | head
```

日志里应有 `Listening on http://127.0.0.1:8040`。第一行 `curl` 应是 `200` 和 `text/html`。若日志是 `NUXT_API_BASE 必须配置为 HTTP/HTTPS 地址`，说明变量没有进进程。若日志监听的是 `3000`，说明还在跑旧进程，先 `pm2 delete isport-college` 再按上面的命令启动。

## Nginx

改现有 `server_name yuntiyu-test2.dream-sports.cn`。若还有一份 `listen 443` 的同名站点，两处一起改。负载均衡已经终结 HTTPS、本机只看到 HTTP 时，下面的 `X-Forwarded-Proto $scheme` 改成 `https`。

在 `location /academy/` 前增加 `/api/`。`proxy_pass` 不要加尾部斜杠，否则 `/api` 前缀会被去掉：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

把原来的根路径：

```nginx
location / {
    index index.html;
    alias /data/isport-test2/web/isport-dashboard-school-itc/;
    try_files $uri $uri/ /index.html;
}
```

换成：

```nginx
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

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 验收

- `https://yuntiyu-test2.dream-sports.cn/` 是学苑首页，刷新仍是该页
- 接口是 `https://yuntiyu-test2.dream-sports.cn/api/v1/...`，返回 200
- 页面资源地址中不出现 `127.0.0.1`
- `/en` 能打开英文页
- `NUXT_PUBLIC_SITE_ENV=test` 时 `/robots.txt` 禁止收录

## 发版

本机重新 `pnpm --filter @isport/portal build`，确认有 `server/index.mjs`、`ecosystem.config.cjs` 且 `preset` 为 `node-server`，再打包上传。服务器解压覆盖 `/data/isport-test2/web/isport-college` 后执行 `pm2 reload isport-college`。端口和上游改 `apps/portal/ecosystem.config.cjs`，并同步本文配置块，重新构建后才会进入压缩包。
