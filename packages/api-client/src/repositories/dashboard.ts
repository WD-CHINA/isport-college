import type { DashboardStats } from '@isport/shared'

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>
}
