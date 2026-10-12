# isport-academy 当前架构

更新日期：2026-10-12。当前只有一个 Nuxt 4 应用与 Nitro 发布产物。门户采用 SSR；管理端采用 CSR，并统一禁止收录。

## 数据与部署边界

SSR 始终请求私有 Runtime Config 的 `apiBase`，不使用入站 Host 决定上游。开发环境由 `.env.development` 提供 `NUXT_API_BASE`，生产由部署环境注入；未配置固定 HTTP/HTTPS 根地址时服务启动失败。浏览器默认请求同源相对路径：开发由 `nitro.devProxy` 转发，生产由 Nginx 转发。`NUXT_PUBLIC_API_BASE` 为绝对地址时浏览器改为直连，供测试使用；它不影响 SSR 上游。响应信封为 `{status,message,data}`，鉴权使用 Bearer，语言使用 `X-Locale: zh-CN|en-US`。生产应用没有同源业务 mock。

SSR 与浏览器统一使用标准 `fetch`，只携带当前会话的 Bearer，不继承入站 Cookie/Authorization。接口地址在 Nitro 启动时检查；接口信封和响应数据各在其边界校验一次，展示层直接使用整理后的类型。

```text
pages → Feature → domain composable
                     ↓
                 useAcademy（当前 Nuxt 请求的 Pinia 与客户端）
                     ↓
                 utils/academy-data + web-response（调用侧验证业务数据）
                     ↓
                 api/academy（路径、方法、参数）
                     ↓
                 api/request（HTTP、信封、鉴权、语言、超时与取消）
                     ↓
                 SSR：NUXT_API_BASE 固定上游；浏览器：devProxy / Nginx / 测试直连地址
```

`api/academy` 中的 TypeScript 类型描述预期协议；运行时验证由调用侧适配器负责。成功 HTTP 响应必须具有完整信封，列表、首页、枚举、计数和媒体字段通过验证后才进入展示组件。登录和资料使用 `utils/profile` 整理。

`ApiError` 同时提供 HTTP `statusCode` 与可序列化的 `data.code`。Nuxt 转换错误后仍可通过 `apiErrorCode()` 识别。请求层按 HTTP/业务状态分类，不解释业务文案；内容调用侧在 `utils/academy-data.ts` 中兼容后端既有的 400 下架响应，登录与筛选接口仍保留校验失败。`ApiRequest` 使用 `(method, path, { body, query, signal })`，避免位置参数占位。默认请求上限为 8 秒，取消信号贯穿请求；取消后的晚到响应不能执行会话副作用。

## 会话职责

- `stores/auth.ts`：会话、当前资料、权限、Cookie 和会话版本；不调用接口、不打开弹窗、不导航。
- `stores/login-ui.ts`：登录意图、弹窗、昵称引导与退出确认。
- `composables/auth/useSessionActions.ts`：登录和退出的接口编排，拒绝旧弹窗或旧会话产生的晚到响应。
- `composables/auth/useSmsLogin.ts`：短信表单、校验和重发倒计时。
- `composables/useProfile.ts`：资料更新；响应仅能写回发出请求时的会话。

`useAcademy()` 创建时显式绑定当前 Nuxt 的 Pinia，并在发送时读取这个 store 的令牌。401 回调携带原请求令牌，仅使匹配会话失效；匿名或旧令牌请求不能清掉后来建立的会话。退出和资料更新遵守相同规则。会话变化只清理详情、个人记录等相关数据缓存，公开首页与列表不会因此消失。

`auth.clearSession()` 主动清理当前会话；`auth.clearSessionIfTokenMatches(token)` 仅在原请求令牌仍匹配时清理，供 401 和退出响应使用。

Cookie 为 SameSite=Lax；`siteEnv=production` 时使用 Secure。令牌放在 store 的私有引用中，暴露的计算属性不会进入 Pinia SSR state。由于保留浏览器直连 Bearer 协议，Cookie 仍需被 JavaScript 读取；本轮没有实现 HttpOnly。若改为 HttpOnly，需要单独设计同源认证代理及部署边界。

`auth` 监听 `useCookie` 同步的外部变化，其他标签页退出或切换账号时同步内存会话、递增会话版本并清理私有数据；相同会话的资料变化仅更新资料，不反复写入 Cookie。个人记录缓存键包含语言、用户和会话版本，语言切换会重新请求对应语言的内容。

当前 `/me` 不返回角色或权限，因此 `hasWebPermission()` 只向有效前台会话开放 `account:view`。菜单和路由使用相同判断；客户端权限判断不能替代学苑后端授权。

## SSR 与故障隔离

公开页不等待 `/me`：资料在浏览器挂载后刷新，上限 2 秒。受保护路由先刷新已登录会话，401 会恢复为访客登录流程；其他资料服务故障保留本地会话，实际业务接口仍由后端鉴权。

详情正文独立 SSR；推荐在浏览器单独请求。推荐失败不会覆盖正文。资源、教师和动态不存在时，页面正文及 HTTP 响应均为 404。浏览计数只在浏览器提交，互动和计数的旧响应不能覆盖新会话数据。

`useContentDetail` 编排正文、推荐与派生数据；`useContentInteractions` 负责点赞、收藏、登录回放和记录缓存刷新；`useContentView` 负责浏览上报与重试。子组合函数读取详情引用，并通过显式更新函数写回当前数据。

`shared/content-query.ts` 是教学资源、教研和校本栏目 URL 查询的唯一规则：拒绝重复参数，页码范围为 1..9999，校验分类及二级分类关系，过滤未知条件；旧 `level` 链接统一转换为 `recommendedLevel`。教师和动态列表复用同一页码解析器。首页水平入口由接口分组生成。

## 目录与组件

```text
apps/portal/app/
  api/                 HTTP 与外部接口定义
  config/capabilities.ts  尚未接入能力的声明
  pages/               每个目录都有入口 *.vue，同级放 components 与 composables
    (home)/index.vue   首页，路由 /
    account/           个人页
    resources/ research/ schools/  三个频道入口，只传入频道
    news/ teachers/    动态与教师
    admin/ lingyue/    管理端与灵跃入口；不可用页来自 components/app
  layouts/             公开与管理端外壳
  components/
    app/               导航、页脚、分页、统一不可用页
    auth/              登录、退出、昵称引导与资料表单
    catalog/           三频道共用的列表、筛选、详情和媒体
    content/           跨页面内容卡片与网格
  composables/
    catalog/           三频道列表、详情、互动与媒体状态
    auth/              登录流程与登录门禁
    useAcademy.ts      当前请求的客户端
    useProfile.ts      资料更新，供个人页与昵称引导共用
    useLocaleSwitch.ts / useRefreshOnFocus.ts
  stores/              auth 与 login-ui
  utils/               调用侧响应验证、资料与 URL 整理
```

业务 composable、store、工具和本地组件显式导入；Nuxt/Vue 内置 API 保留自动导入。`antdv-next` 组件由 `@antdv-next/nuxt` 以 `A` 前缀自动注册，运行时函数和静态属性仍显式导入。展示组件通过 props/emits 与业务编排通信。分页由 `components/app/AppPagination.vue` 提供，颜色优先消费 `design-tokens`。

投稿、积分、教师资料、灵跃和管理端接口尚未接入。`config/capabilities.ts` 是其当前声明；灵跃操作入口禁用，已有路由保留门禁并展示统一不可用页。旧课程组件、失败接口、伪业务状态和原型模型已移除，旧 `/courses` 兼容路由与 `/rsp` 隔离响应继续保留。新增能力需要真实协议与对应测试，不能只打开声明中的开关。

## Workspace 边界

| 层   | 目录                                                 | 职责                                      |
| ---- | ---------------------------------------------------- | ----------------------------------------- |
| 应用 | `apps/portal`                                        | 路由、业务、状态、Nitro 服务与部署        |
| 展示 | `ui-core`、`ui-admin`、`rich-text`                   | 通用展示与交互，通过输入/事件使用业务能力 |
| 基础 | `shared`、`design-tokens`                            | 平台无关类型、常量、纯函数与设计令牌      |
| 配置 | `i18n`、`unocss-preset`、`eslint-config`、`tsconfig` | 国际化及工程配置                          |

根 `eslint.config.mjs` 是唯一入口。既有规则约束分层方向，`packages/eslint-config/boundaries.mjs` 补充解析后的 workspace 路径、exports、实际依赖声明与循环依赖检查。展示包禁止请求、store 和路由运行时，并检查直接/别名网络调用。包内相对路径也不能绕过应用与跨包边界。规则的行为由 Node 测试覆盖。

Turbo 将根 ESLint、Stylelint、Prettier 配置和架构规则列为全局缓存输入，规则变化会使旧任务缓存失效。构建任务显式传递并缓存区分 `NUXT_API_BASE`、`NUXT_PUBLIC_API_BASE` 和 `NUXT_PUBLIC_SITE_ENV`，避免环境配置变化后复用旧产物。

## 国际化、收录与发布

默认中文无前缀，英文使用 `/en`；根路径按语言 Cookie 或浏览器偏好重定向，具体业务路由以 URL 为准。SSR 学苑语言头读取请求路径；客户端同步读取当前 Nuxt 注入的 i18n 语言，与数据缓存键使用同一语言来源，避免导航中语言已切换但 currentRoute 仍为旧路径。不依赖异步 i18n composable。

管理端在 Nuxt routeRules 和 HTTP 中间件中强制 CSR，后者使用归一化路径处理大小写变体。管理及个人路由输出 `noindex, nofollow, noarchive`；非生产环境全站禁止收录。发布只启动一个 `.output/server/index.mjs`。

| 环境变量               | 用途                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `NUXT_API_BASE`        | SSR 固定上游及开发代理上游；开发由 `.env.development` 提供，生产部署时注入；必须为 HTTP/HTTPS 根地址 |
| `NUXT_PUBLIC_API_BASE` | 浏览器接口地址；空或 `/` 表示当前站点，绝对根地址表示直连；不决定 SSR 目标                           |
| `NUXT_PUBLIC_SITE_ENV` | 默认 development；production 启用 Secure Cookie 并允许公开页收录                                     |

生产启动时设置 `NUXT_API_BASE`，例如 `NUXT_API_BASE=https://api.example.com node .output/server/index.mjs`（地址由部署环境提供）。Nuxt 的 `--dotenv` 在开发与构建时加载 `.env`，生产 Node 进程不自动加载 `.env.production`。公开页收录及 Secure Cookie 仍由实际部署环境的 `NUXT_PUBLIC_SITE_ENV` 决定。

## 验收

`pnpm check:ci` 执行 lint、CSS、format、类型、单测、构建及生产产物 E2E，覆盖率使用 `pnpm test:coverage` 单独生成。E2E 的 `/api/v1` 服务器只位于 `apps/portal/e2e`，由 Playwright 启动；SSR 和浏览器都通过外域 HTTP 请求它，不依赖内网服务或生产业务 mock。

回归涵盖交错 SSR 会话、旧 401、晚到登录/退出、响应信封、超时、资料、短信登录、恢复导航、个人记录、推荐降级、真实 404、媒体、移动端、普通用户门禁、语言及 noindex。具体检查结果记录在 `docs/repair-plan.md`。
