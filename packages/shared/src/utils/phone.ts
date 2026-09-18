/**
 * 移除手机号中的所有空白字符。
 * 输入校验前先归一化，因此 "188 8888 8888" 与 "18888888888" 等价。
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '')
}

/** 校验中国大陆手机号（归一化后 11 位，1 开头，第二位 3-9） */
export function isValidCnMobile(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(normalizePhone(phone))
}
