import { test, expect } from '@playwright/test'
import type { BrowserContext } from '@playwright/test'
import { AUTH_COOKIE_NAME } from '@isport/shared'
import type { WebSession } from '@isport/shared'

/** 写入前台会话 Cookie。token 须来自真实学苑登录。 */
export async function setSession(context: BrowserContext, session: WebSession, baseURL: string) {
  await context.addCookies([
    { name: AUTH_COOKIE_NAME, value: encodeURIComponent(JSON.stringify(session)), url: baseURL },
  ])
}

export { expect, test }
