export interface PageSpeedResult {
  performanceScore: number
  lcp: number
  fcp: number
  tbt: number
  cls: number
  tti: number
  isMobileFriendly: boolean
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`

  const res = await fetch(endpoint, { next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`PageSpeed API returned ${res.status}`)
  }

  const data = await res.json()
  const lr = data.lighthouseResult

  const performanceScore = Math.round((lr.categories.performance.score ?? 0) * 100)
  const lcp = (lr.audits['largest-contentful-paint']?.numericValue ?? 0) / 1000
  const fcp = (lr.audits['first-contentful-paint']?.numericValue ?? 0) / 1000
  const tbt = lr.audits['total-blocking-time']?.numericValue ?? 0
  const cls = lr.audits['cumulative-layout-shift']?.numericValue ?? 0
  const tti = (lr.audits['interactive']?.numericValue ?? 0) / 1000
  const isMobileFriendly = lr.audits['viewport']?.score === 1

  return { performanceScore, lcp, fcp, tbt, cls, tti, isMobileFriendly }
}
