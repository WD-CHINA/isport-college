# 部署

门户是 Nuxt 4 的 Nitro `node-server` 产物。发布只启动一个 Node 进程：门户页面走 SSR，管理端走 CSR。浏览器请求当前站点的 `/api` 与 `/statics`，由 Nginx 转发到学苑后端；SSR 使用 `NUXT_API_BASE`，不看入站 Host。生产进程不读取 `.env.production`。

## 构建

在构建机使用 Node.js 24.11 或更高的 Node 24，以及 pnpm 10.33.0。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm release
```

`pnpm release` 先执行完整门禁，再把 `apps/portal/.output` 复制为根目录 `dist/`。只打包、不跑门禁时用 `pnpm build`，产物在 `apps/portal/.output`，目录结构与 `dist/` 相同。

上传整个 `dist/`，其中包含 `server/`（含 `node_modules`）和 `public/`。服务器上不执行 `pnpm install` 或 `pnpm build`。

## 环境变量

| 变量                   | 作用                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `NUXT_API_BASE`        | SSR 固定上游，必须是 `http://` 或 `https://`，可带路径前缀。缺失或格式不对时进程退出        |
| `NUXT_PUBLIC_API_BASE` | 浏览器接口地址。`/` 表示当前站点，由 Nginx 转发                                             |
| `NUXT_PUBLIC_SITE_ENV` | `production` 允许公开页收录，并为登录 Cookie 加上 Secure。测试环境使用 `test`，全站禁止收录 |
| `HOST`                 | 监听地址。只给本机 Nginx 使用时设为 `127.0.0.1`                                             |
| `PORT`                 | 监听端口                                                                                    |

## 测试环境

域名 `yuntiyu-test2.dream-sports.cn`。学苑后端已由 Nginx 的 `/academy/` 转到本机 `8090`（匹配前缀会被去掉）。门户进程监听 `4179`，目录以 `/opt/isport-college` 为例。

```bash
cd /opt/isport-college
npm install -g pm2

NODE_ENV=production \
HOST=127.0.0.1 \
PORT=4179 \
NUXT_API_BASE=http://127.0.0.1:8090 \
NUXT_PUBLIC_API_BASE=/ \
NUXT_PUBLIC_SITE_ENV=test \
pm2 start server/index.mjs --name isport-college

pm2 save
pm2 startup
```

`pm2 startup` 会打印一行 `sudo env PATH=...`，把那一行原样执行后再执行一次 `pm2 save`。这样 SSH 退出和机器重启后进程仍在。已有同名进程时先 `pm2 delete isport-college`，再按上面的环境变量启动，避免沿用旧端口。

确认本机可访问：

```bash
curl -I http://127.0.0.1:4179/
```

安全组只开放 80（以及已有的 443），不开放 4179。

### Nginx

在 `server_name yuntiyu-test2.dream-sports.cn` 的 `location /` 之前增加接口转发。浏览器请求的是当前域名的 `/api/v1` 和 `/statics`；只保留现有 `/academy/` 时，页面可以打开，接口没有数据。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8090/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /statics/ {
    proxy_pass http://127.0.0.1:8090/statics/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

把原来的 `location /`（`alias /data/isport-test2/web/isport-dashboard-school-itc/`）换成门户：

```nginx
location / {
    proxy_pass http://127.0.0.1:4179;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

更换后，`/` 不再提供学校看板静态站。`/academy/`、`/cms/`、`/files/` 等更长的 location 仍走原来的端口。

现有 `location /admin/` 比 `/` 更具体，`/admin` 仍进入 `127.0.0.1:8091`，不会进入门户管理端。

```bash
nginx -t && nginx -s reload
```

## 更新

用新的 `dist/` 覆盖服务器目录后执行：

```bash
pm2 restart isport-college
```

环境变量有变化时，先 `pm2 delete isport-college`，再按启动命令重新 `pm2 start`，然后 `pm2 save`。

日志：

```bash
pm2 logs isport-college
pm2 status
```

## 正式环境

正式环境同样上传整个 `dist/`，用 PM2 或 systemd 驻留 `node dist/server/index.mjs`。`NUXT_PUBLIC_SITE_ENV=production`，站点使用 HTTPS，否则 Secure Cookie 无法写入。`NUXT_API_BASE` 改为该环境可访问的学苑后端地址；浏览器仍使用 `NUXT_PUBLIC_API_BASE=/`，由该环境的 Nginx 转发 `/api/` 与 `/statics/`。
