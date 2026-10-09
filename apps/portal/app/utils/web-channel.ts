import type { WebChannel } from '@isport/shared'

export function toWebChannel(channel: 'resource' | 'research' | 'school'): WebChannel {
  if (channel === 'resource') return 'RESOURCE'
  if (channel === 'research') return 'RESEARCH'
  return 'SCHOOL'
}
