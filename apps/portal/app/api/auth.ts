import md5 from 'crypto-js/md5'

import type { AuthSession } from '@isport/shared'

import { useApi } from './request'

/** 图形验证码挑战（GET /rsp/app/captcha） */
export interface CaptchaChallenge {
  ckey: string
  length: number
  /** base64 图片 data URI，直接用于 img[src] */
  base64Img: string
}

/** 登录载荷：ckey/captcha 必须来自同一次 fetchCaptcha 挑战 */
export interface LoginPayload {
  username: string
  password: string
  captcha: string
  ckey: string
}

/** 后端登录结果（isport-library LoginResult） */
interface LoginResult {
  id: number
  /** 1 教师、2 管理员、3 超级管理员 */
  roleId: 1 | 2 | 3
  authorities: string
  token: string
  nickName: string
  schoolName: string
}

/** 获取图形验证码；提交失败后需重新获取（ckey 一次性） */
export async function fetchCaptcha(): Promise<CaptchaChallenge> {
  const challenge = await useApi()<CaptchaChallenge>('/rsp/app/captcha')
  // 后端返回的 base64Img 为裸 base64（无 data URI 前缀），归一化后才能直接用于 img[src]
  return {
    ...challenge,
    base64Img: toDataUri(challenge.base64Img),
  }
}

/** 为裸 base64 图片补 data URI 前缀；已是 data URI 或空值则原样返回 */
function toDataUri(image: string): string {
  if (!image || image.startsWith('data:')) return image
  return `data:image/jpeg;base64,${image}`
}

/** 登录：密码按后端约定 MD5 摘要后以 encodePassword 提交 */
export async function login(payload: LoginPayload): Promise<AuthSession> {
  const result = await useApi()<LoginResult>('/rsp/user/login', {
    method: 'POST',
    body: {
      username: payload.username,
      encodePassword: md5(payload.password).toString(),
      ckey: payload.ckey,
      captcha: payload.captcha,
    },
  })

  return {
    user: {
      id: String(result.id),
      phone: '',
      name: result.nickName,
      // 管理员/超级管理员角色放行管理端，教师仅普通用户
      roles: result.roleId >= 2 ? ['user', 'admin'] : ['user'],
    },
    token: result.token,
    issuedAt: new Date().toISOString(),
  }
}

/** 退出登录：通知后端失效 token（调用方负责无论如何都清理本地会话） */
export async function logout(): Promise<void> {
  await useApi()<string>('/rsp/user/logout', { method: 'POST' })
}
