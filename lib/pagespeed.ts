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

  let res: Response
  try {
    res = await fetch(endpoint, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(20000),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new Error('PageSpeed-analysen tog för lång tid – sajten kan vara för långsam eller otillgänglig.')
    }
    throw err
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('PageSpeed-API:et är tillfälligt överbelastat. Vänta någon minut och försök igen.')
    }
    throw new Error(`PageSpeed-API:et svarade med felkod ${res.status}. Försök igen om en stund.`)
  }

  const data = await res.json()
  const lr = data.lighthouseResult

  const performanceScore = Math.round((lr.categories.performance.score ?? 0) * 100)
  const lcp = (lr.audits['largest-contentful-paint']?.numericValue ?? 0) / 1000
  const fcp = (lr.audits['first-contentful-paint']?.numericValue ?? 0) / 1000
  const tbt = lr.audits['total-blocking-time']?.numericValue ?? 0
  const cls = lr.audits['cumulative-layout-shift']?.numericValue ?? 0
  const tti = (lr.audits['interactive']?.numericValue ?? 0) / 1000
  const isMobileFriendly = lr.audits['viewport']?.score !== 0

  return { performanceScore, lcp, fcp, tbt, cls, tti, isMobileFriendly }
}
