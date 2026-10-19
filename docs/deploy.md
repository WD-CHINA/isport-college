# 测试环境部署

门户部署到 `https://yuntiyu-test2.dream-sports.cn`。本机构建 SSR 产物，只把 `apps/portal/.output` 上传到 ECS。服务器不拉取仓库，也不安装 pnpm。

## 请求边界

```text
浏览器 /、/en、/resources…
  → Nginx → 127.0.0.1:8040 Nuxt

浏览器 /api/v1/…
  → Nginx → 127.0.0.1:8090 学苑后端（保留 /api 前缀）

Nuxt 服务端渲染
  → 直接请求 http://127.0.0.1:8090/api/v1/…
```

首屏由 Nuxt 直连 `8090`。切换页面后，浏览器请求当前域名的 `/api/v1/...`，必须由 Nginx 转发。`8040` 和 `8090` 只监听本机，安全组不放行。

不新增 `/statics/`。`NUXT_PUBLIC_API_BASE=/` 时，接口返回的 `/statics/...` 仍是门户相对路径。已经指向 `https://yuntiyu-test2.dream-sports.cn/academy/statics/...` 的地址，由现有 `location /academy/` 转到 `8090`。

`/academy/`、`/dashboard/`、`/cms/`、`/files/` 等保持不动。`location /admin/` 仍指向 `8091`，学苑自己的 `/admin` 页面到不了 Nuxt。

## 本机构建并上传

使用 Node 24.11 或更高的 24，以及 pnpm 10.33.0。

```bash
pnpm install --frozen-lockfile
pnpm --filter @isport/portal build
test -f apps/portal/.output/server/index.mjs \
  && test -f apps/portal/.output/ecosystem.config.cjs \
  && test -f apps/portal/.output/server/node_modules/hookable/package.json \
  && echo OK
```

`apps/portal/.output/nitro.json` 的 `preset` 必须是 `node-server`。构建会做三件事：生成 SSR 产物、把 `server/node_modules` 里的软链展开成真实目录、把 `apps/portal/ecosystem.config.cjs` 复制进 `.output`。没有 `server/index.mjs` 的静态目录不能上传。

```bash
tar -czf isport-college.tar.gz -C apps/portal/.output .
scp isport-college.tar.gz root@<ECS公网IP>:/data/isport-test2/isport-college.tar.gz
```

## 服务器首次准备

只需 Node 24 和 PM2：

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm install -g pm2
```

## 发布到服务器

先停进程并删除旧目录。解压不会删掉目录里多余的旧文件，覆盖安装会留下过期的 `vue-router` 等依赖。

```bash
pm2 delete isport-college || true
rm -rf /data/isport-test2/web/isport-college
mkdir -p /data/isport-test2/web/isport-college
tar -xzf /data/isport-test2/isport-college.tar.gz -C /data/isport-test2/web/isport-college
```

解压后应有 `server/index.mjs`、`public/` 和 `ecosystem.config.cjs`。进程配置来自模板 `apps/portal/ecosystem.config.cjs`：

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

生产进程不读取 `.env.production`。`NUXT_API_BASE` 缺失或不是 HTTP/HTTPS 地址时进程启动失败。端口必须是字符串，否则 Nitro 会听默认的 `3000`。测试环境保持 `NUXT_PUBLIC_SITE_ENV=test`，全站不收录。

```bash
cd /data/isport-test2/web/isport-college
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
pm2 logs isport-college --lines 20 --nostream
curl -sI http://127.0.0.1:8040/ | head
```

日志里应有 `Listening on http://127.0.0.1:8040`。`curl` 应是 `200` 和 `text/html`。

## Nginx

改现有 `server_name yuntiyu-test2.dream-sports.cn`。域名对外是 HTTPS，本机这份配置听 80。若前面的负载均衡已经终结 TLS，保持 `X-Forwarded-Proto $scheme` 为实际到达本机的协议；本机只看到 HTTP 时，改成 `https`。

`/api/` 的 `proxy_pass` 不能加尾部斜杠。加了斜杠会去掉 `/api`，后端收到 `/v1/...`，切页后的接口失败，首屏仍然正常。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_redirect off;
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

`/academy/` 继续使用带尾部斜杠的 `proxy_pass http://127.0.0.1:8090/;`，用于去掉 `/academy` 前缀。

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI http://127.0.0.1/api/v1/home -H 'Host: yuntiyu-test2.dream-sports.cn' | head
```

## 验收

- `https://yuntiyu-test2.dream-sports.cn/` 是学苑首页，刷新仍是该页
- 切换页面后，请求是 `https://yuntiyu-test2.dream-sports.cn/api/v1/...`，状态 200，响应为 JSON
- 页面资源地址中不出现 `127.0.0.1`
- `/en` 能打开英文页
- `/robots.txt` 禁止收录

## 再次发版

Node、PM2 和 Nginx 已经就绪时，不要重装，也不要改 Nginx。本机构建并上传后，在原目录解压，再重启已有进程。

本机：

```bash
pnpm install --frozen-lockfile
pnpm --filter @isport/portal build
test -f apps/portal/.output/server/index.mjs \
  && test -f apps/portal/.output/ecosystem.config.cjs \
  && test -f apps/portal/.output/server/node_modules/hookable/package.json \
  && echo OK
tar -czf isport-college.tar.gz -C apps/portal/.output .
scp isport-college.tar.gz root@<ECS公网IP>:/data/isport-test2/isport-college.tar.gz
```

看到 `OK`，且 `apps/portal/.output/nitro.json` 的 `preset` 为 `node-server` 后再上传。

服务器：

```bash
tar -xzf /data/isport-test2/isport-college.tar.gz -C /data/isport-test2/web/isport-college
pm2 restart isport-college
pm2 logs isport-college --lines 20 --nostream
curl -sI http://127.0.0.1:8040/ | head
```

`pm2 restart` 按第一次 `pm2 start` 记下的目录、脚本和端口重新拉起进程，并读取磁盘上的新 `server/index.mjs`。它不会重新读取 `ecosystem.config.cjs`。端口或 `NUXT_API_BASE` 有变化时，改用 `pm2 delete isport-college` 后执行 `pm2 start ecosystem.config.cjs --env production`。

解压只覆盖压缩包里有的文件，不会删掉旧目录里多出来的文件。这些多余文件不会被新代码加载。日志里应有 `Listening on http://127.0.0.1:8040`，`curl` 应是 `200` 和 `text/html`。然后再打开首页并切换一次页面，确认 `/api/v1/...` 返回 JSON。
