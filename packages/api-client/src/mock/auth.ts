import { MOCK_RULES } from '@isport/mock-data'
import { AVATAR_IDS, normalizeNickname, type TeacherProfile } from '@isport/shared'
import { ApiError } from '../errors'
import {
  CommittedError,
  choice,
  flag,
  nextId,
  requireP1,
  requireUser,
  text,
  type MockContext,
} from './context'
import { reward } from './points'

function phoneNumber(input: Record<string, unknown>): string {
  const phone = text(input, 'phone', 11)
  if (!/^1\d{10}$/.test(phone)) throw ApiError.validation('请输入 11 位手机号')
  return phone
}

export function handleAuth(
  ctx: MockContext,
  operation: string,
  input: Record<string, unknown>,
): unknown {
  const { state } = ctx
  if (operation === 'auth/challenge') {
    const phone = phoneNumber(input)
    const previous = state.challenges.filter(item => item.phone === phone).at(-1)
    if (
      previous &&
      Date.parse(ctx.now) - Date.parse(previous.createdAt) < MOCK_RULES.smsRetrySeconds * 1000
    )
      throw ApiError.validation('请等待倒计时结束后重试')
    state.challenges
      .filter(item => item.phone === phone)
      .forEach(item => {
        item.consumed = true
      })
    const id = ctx.randomId()
    const code = '246810'
    state.challenges.push({ id, phone, code, createdAt: ctx.now, attempts: 0, consumed: false })
    return { id, retryAfter: MOCK_RULES.smsRetrySeconds, demoCode: code }
  }
  if (operation === 'auth/login') {
    const phone = phoneNumber(input)
    if (!flag(input, 'agreed')) throw ApiError.validation('请先阅读并同意协议')
    const challengeId = text(input, 'challengeId', 128)
    const code = text(input, 'code', 6)
    const challenge = state.challenges.find(item => item.id === challengeId && item.phone === phone)
    if (
      !challenge ||
      challenge.consumed ||
      challenge.attempts >= MOCK_RULES.smsAttempts ||
      Date.parse(ctx.now) - Date.parse(challenge.createdAt) >= MOCK_RULES.smsTtlSeconds * 1000
    )
      throw ApiError.validation('验证码已失效，请重新获取')
    challenge.attempts++
    if (challenge.code !== code) throw new CommittedError('VALIDATION_FAILED', '验证码错误')
    challenge.consumed = true
    let user = state.users.find(item => item.phone === phone)
    const isNew = !user
    if (!user) {
      user = {
        id: nextId(ctx, 'user'),
        phone,
        name: '',
        roles: ['user'],
        avatar: AVATAR_IDS[state.sequence % AVATAR_IDS.length]!,
        nicknamePrompted: false,
        createdAt: ctx.now,
      }
      state.users.push(user)
    }
    const promptNickname = !user.nicknamePrompted
    user.nicknamePrompted = true
    const token = ctx.randomId()
    state.sessions.push({ token, userId: user.id, issuedAt: ctx.now })
    return { user, token, issuedAt: ctx.now, isNew, promptNickname }
  }
  if (operation === 'auth/logout') {
    state.sessions = state.sessions.filter(item => item.token !== ctx.token)
    return { ok: true }
  }
  if (operation === 'account/me') return requireUser(ctx)
  if (operation === 'account/profile') {
    const user = requireUser(ctx)
    const nickname = normalizeNickname(text(input, 'nickname', 100, true))
    if (nickname === null)
      throw ApiError.validation('昵称须为 2–6 个中文、英文字母或数字，也可留空')
    user.name = nickname
    user.avatar = choice(input, 'avatar', AVATAR_IDS)
    return user
  }
  if (operation === 'account/teacher') {
    requireP1(ctx)
    const user = requireUser(ctx)
    const teacher: TeacherProfile = {
      realName: text(input, 'realName', 50),
      province: text(input, 'province', 50),
      city: text(input, 'city', 50),
      district: text(input, 'district', 50),
      school: text(input, 'school', 100),
      teacherRole: text(input, 'teacherRole', 50),
      stage: text(input, 'stage', 50),
      subject: text(input, 'subject', 50),
    }
    user.teacher = teacher
    reward(ctx, user.id, 'profile', MOCK_RULES.profileReward)
    return user
  }
  if (operation === 'lingyue/enter') {
    const user = requireUser(ctx)
    let link = state.lingyue.find(item => item.userId === user.id)
    if (!link && input.authorize !== true)
      return { status: 'authorization_required', simulated: true }
    if (!link) {
      link = { userId: user.id, externalId: nextId(ctx, 'lingyue'), linked: false }
      state.lingyue.push(link)
    }
    link.linked = true
    return { status: 'linked', simulated: true }
  }
  return undefined
}
