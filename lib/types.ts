export type Status = 'green' | 'yellow' | 'red'

export interface Check {
  status: Status
  label: string
  description: string
  value?: string | number | boolean
}

export interface CategoryResult {
  status: Status
  checks: Record<string, Check>
}

export interface CompetitorData {
  url: string
  score: number
  overallStatus: Status
  categories: {
    performance: CategoryResult
    seo: CategoryResult
    conversion: CategoryResult
  }
}

export interface ReportData {
  url: string
  timestamp: string
  score: number
  overallStatus: Status
  categories: {
    performance: CategoryResult
    seo: CategoryResult
    conversion: CategoryResult
  }
  summary: string
  leadText: string
  competitor?: CompetitorData
}
