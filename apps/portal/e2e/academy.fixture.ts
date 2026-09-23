import { randomUUID } from 'node:crypto'
import { test as base, expect } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import type { AcademyOperations, AcademySession } from '@isport/api-client'
import { AUTH_COOKIE_NAME } from '@isport/shared'

export async function setNamespace(context: BrowserContext, namespace: string, baseURL: string) {
  await context.addCookies([{ name: 'academy_mock_namespace', value: namespace, url: baseURL }])
}

export const test = base.extend<{ namespace: string }>({
  namespace: [
    async ({ context, baseURL }, use) => {
      const namespace = `e2e-${randomUUID()}`
      await setNamespace(context, namespace, baseURL!)
      const response = await context.request.post('/api/academy/mock/control', {
        headers: { 'x-mock-control-key': process.env.ACADEMY_TEST_CONTROL_KEY! },
        data: { action: 'reset' },
      })
      expect(response.ok()).toBe(true)
      await use(namespace)
    },
    { auto: true },
  ],
})

export async function api<K extends keyof AcademyOperations>(
  context: BrowserContext,
  operation: K,
  data: AcademyOperations[K]['input'],
  token?: string,
) {
  const response = await context.request.post(`/api/academy/v1/${operation}`, {
    data,
    headers: token ? { Authorization: token } : undefined,
  })
  expect(response.ok(), await response.text()).toBe(true)
  return ((await response.json()) as { data: AcademyOperations[K]['output'] }).data
}

export async function login(context: BrowserContext, phone = '18800000001') {
  const challenge = await api(context, 'auth/challenge', { phone })
  return api(context, 'auth/login', {
    phone,
    challengeId: challenge.id,
    code: challenge.demoCode,
    agreed: true,
  })
}

export async function setSession(
  context: BrowserContext,
  session: AcademySession,
  baseURL: string,
) {
  await context.addCookies([
    { name: AUTH_COOKIE_NAME, value: encodeURIComponent(JSON.stringify(session)), url: baseURL },
  ])
}

export async function smsLogin(page: Page, phone = '18800000001') {
  const dialog = page.getByRole('dialog', { name: /登录融梦学苑|Sign In/ })
  await expect(dialog).toBeVisible()
  await dialog.locator('#login-phone').fill(phone)
  await dialog.getByRole('button', { name: /获取验证码|Get code/ }).click()
  const code = (await dialog.getByTestId('demo-code').textContent())!.match(/\d{6}/)![0]
  await dialog.locator('#login-code').fill(code)
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /^登\s*录$|^Sign In$/ }).click()
  await expect(dialog).toBeHidden()
}

export async function fault(context: BrowserContext, operation: string, kind = 'error') {
  const response = await context.request.post('/api/academy/mock/control', {
    headers: { 'x-mock-control-key': process.env.ACADEMY_TEST_CONTROL_KEY! },
    data: { action: 'fault', operation, kind },
  })
  expect(response.ok()).toBe(true)
}

export { expect }
