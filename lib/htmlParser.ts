import * as cheerio from 'cheerio'

export interface HtmlParseResult {
  metaTitle: string | null
  metaDescription: string | null
  h1Count: number
  h2Count: number
  imagesTotal: number
  imagesMissingAlt: number
  wordCount: number
  hasForms: boolean
  hasPhone: boolean
  ctaScore: number
  hasSocialProof: boolean
  fetchError: boolean
}

const STRONG_CTA_WORDS = [
  'kontakta', 'boka', 'kom igång', 'get started', 'contact', 'ring oss',
  'offert', 'prova gratis', 'köp', 'beställ', 'skicka'
]

const WEAK_CTA_WORDS = ['läs mer', 'mer information']

const SOCIAL_PROOF_WORDS = [
  'omdöme', 'recension', 'review', 'testimonial', 'kund', 'stjärn', 'star',
  'rating', 'nöjd', 'rekommenderar', 'certifi', 'award'
]

const PHONE_REGEX = /(\+46|0)([-\s]?\d){6,10}/

function detectCtaScore($: cheerio.CheerioAPI): number {
  const ctaTexts: string[] = []
  $('button, a, input[type="submit"]').each((_, el) => {
    const text = $(el).text().toLowerCase().trim()
    if (text) ctaTexts.push(text)
  })

  const combined = ctaTexts.join(' ')
  if (STRONG_CTA_WORDS.some(word => combined.includes(word))) return 2
  if (WEAK_CTA_WORDS.some(word => combined.includes(word))) return 1
  return 0
}

function detectSocialProof($: cheerio.CheerioAPI): boolean {
  const bodyText = $('body').text().toLowerCase()
  if (SOCIAL_PROOF_WORDS.some(word => bodyText.includes(word))) return true

  let found = false
  $('[class], [id]').each((_, el) => {
    const cls = ($(el).attr('class') ?? '').toLowerCase()
    const id = ($(el).attr('id') ?? '').toLowerCase()
    if (SOCIAL_PROOF_WORDS.some(word => cls.includes(word) || id.includes(word))) {
      found = true
    }
  })
  return found
}

export async function parseHtml(url: string): Promise<HtmlParseResult> {
  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RelativtAuditor/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch {
    return {
      metaTitle: null,
      metaDescription: null,
      h1Count: 0,
      h2Count: 0,
      imagesTotal: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
      hasForms: false,
      hasPhone: false,
      ctaScore: 0,
      hasSocialProof: false,
      fetchError: true,
    }
  }

  const $ = cheerio.load(html)

  const metaTitle = $('title').first().text().trim() || null
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? null

  const h1Count = $('h1').length
  const h2Count = $('h2').length

  const images = $('img')
  const imagesTotal = images.length
  let imagesMissingAlt = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined || alt.trim() === '') imagesMissingAlt++
  })

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length

  const hasForms = $('form').length > 0
  const hasPhone = PHONE_REGEX.test(bodyText)
  const ctaScore = detectCtaScore($)
  const hasSocialProof = detectSocialProof($)

  return {
    metaTitle,
    metaDescription,
    h1Count,
    h2Count,
    imagesTotal,
    imagesMissingAlt,
    wordCount,
    hasForms,
    hasPhone,
    ctaScore,
    hasSocialProof,
    fetchError: false,
  }
}
