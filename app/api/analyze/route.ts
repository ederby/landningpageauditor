import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
import { fetchPageSpeed } from '@/lib/pagespeed'
import { parseHtml } from '@/lib/htmlParser'
import { generateReport } from '@/lib/reportGenerator'
import { type CompetitorData } from '@/lib/types'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 10) return false

  entry.count++
  return true
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

async function sendPingNotification(url: string, competitorUrl?: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return
  try {
    const text = competitorUrl
      ? `🔍 Ny analys: ${url} (jämförelse med ${competitorUrl})`
      : `🔍 Ny analys: ${url}`
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    // Notification failure should never break the response
  }
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'För många anrop. Försök igen om en minut.' }, { status: 429 })
  }

  let body: { url?: string; competitorUrl?: string; keyword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig request.' }, { status: 400 })
  }

  const { url, competitorUrl, keyword } = body
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Ogiltig eller saknad URL. URL:en måste börja med http:// eller https://' }, { status: 400 })
  }

  const hasCompetitor = Boolean(competitorUrl && /^https?:\/\//i.test(competitorUrl))

  try {
    const [mainResults, compResults] = await Promise.all([
      Promise.all([fetchPageSpeed(url), parseHtml(url, keyword)]),
      hasCompetitor
        ? Promise.all([fetchPageSpeed(competitorUrl!), parseHtml(competitorUrl!, keyword)])
        : Promise.resolve(null),
    ])

    const [psResult, htmlResult] = mainResults
    const report = generateReport(url, psResult, htmlResult)

    let competitor: CompetitorData | undefined
    if (compResults) {
      const [compPs, compHtml] = compResults
      const compReport = generateReport(competitorUrl!, compPs, compHtml)
      competitor = {
        url: competitorUrl!,
        score: compReport.score,
        keyword: compReport.keyword,
        overallStatus: compReport.overallStatus,
        categories: compReport.categories,
      }
    }

    sendPingNotification(url, competitorUrl).catch(() => {})

    return NextResponse.json({ ...report, competitor })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Något gick fel. Försök igen.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
