import { NextRequest, NextResponse } from 'next/server'
import { fetchPageSpeed } from '@/lib/pagespeed'
import { parseHtml } from '@/lib/htmlParser'
import { generateReport } from '@/lib/reportGenerator'

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

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'För många anrop. Försök igen om en minut.' }, { status: 429 })
  }

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig request.' }, { status: 400 })
  }

  const { url } = body
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Ogiltig eller saknad URL. URL:en måste börja med http:// eller https://' }, { status: 400 })
  }

  try {
    const [psResult, htmlResult] = await Promise.all([
      fetchPageSpeed(url),
      parseHtml(url),
    ])

    const report = generateReport(url, psResult, htmlResult)
    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Okänt fel'
    return NextResponse.json({ error: `Analysen misslyckades: ${message}` }, { status: 500 })
  }
}
