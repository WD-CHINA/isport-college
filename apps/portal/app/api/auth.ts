import type { AcademyOperations } from '@isport/api-client'

export type LoginPayload = AcademyOperations['auth/login']['input']
export type SmsChallenge = AcademyOperations['auth/challenge']['output']

export function requestSms(phone: string) {
  return useAcademy().call('auth/challenge', { phone })
}

export function login(payload: LoginPayload) {
  return useAcademy().call('auth/login', payload)
}

export function logout() {
  return useAcademy().call('auth/logout', {})
}
