import { test, expect } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { AUTH_COOKIE_NAME } from '@isport/shared'
import type { WebSession } from '@isport/shared'

export function testSession(id = 1, suffix = randomUUID()): WebSession {
  return {
    token: `e2e-${id}-${suffix}`,
    newUser: false,
    profile: {
      id,
      phoneMask: '138****8000',
      nickname: `测试用户${id}`,
      avatarCode: 1,
      nicknamePromptNeeded: false,
    },
  }
}
export async function setSession(context: BrowserContext, session: WebSession, baseURL: string) {
  await context.addCookies([
    { name: AUTH_COOKIE_NAME, value: encodeURIComponent(session.token), url: baseURL },
  ])
}
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const element = document.querySelector('#__nuxt') as Element & {
      __vue_app__?: { $nuxt?: { isHydrating: boolean } }
    }
    return element?.__vue_app__?.$nuxt?.isHydrating === false
  })
}
export async function smsLogin(page: Page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('#login-phone').fill('13800138000')
  await dialog.getByRole('button', { name: '获取验证码' }).click()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await dialog.locator('#login-code').fill('123456')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog).toBeHidden()
}

export async function switchLanguage(page: Page, locale: 'zh' | 'en') {
  await waitForHydration(page)
  const current = locale === 'en' ? '语言 简体中文' : 'Language English'
  const target = locale === 'en' ? 'English' : '简体中文'
  await page.getByRole('button', { name: current, exact: true }).click()
  await page.getByRole('menuitem', { name: target, exact: true }).click()
  await expect(
    page.getByRole('button', {
      name: locale === 'en' ? 'Language English' : '语言 简体中文',
      exact: true,
    }),
  ).toBeVisible()
}
export { expect, test }
