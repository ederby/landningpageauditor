import * as cheerio from 'cheerio'

export interface HtmlParseResult {
  metaTitle: string | null
  metaTitleLength: number | null
  metaDescription: string | null
  metaDescriptionLength: number | null
  h1Count: number
  h2Count: number
  imagesTotal: number
  imagesMissingAlt: number
  wordCount: number
  hasForms: boolean
  hasPhone: boolean
  ctaScore: number
  hasSocialProof: boolean
  hasOpenGraph: boolean
  isHttps: boolean
  keyword: string | null
  keywordInTitle: boolean | null
  keywordInH1: boolean | null
  keywordInMetaDescription: boolean | null
  keywordBodyCount: number | null
  fetchError: boolean
}

const STRONG_CTA_WORDS = [
  'kontakta', 'boka', 'kom igång', 'get started', 'contact', 'ring oss',
  'offert', 'prova gratis', 'köp', 'beställ',
]

const WEAK_CTA_WORDS = ['läs mer', 'mer information']

const CTA_SECTION_CLASS_REGEX = /\b(cta|hero|banner|call-to-action|contact|kontakt|action)\b/

const CTA_HEADING_WORDS = [
  'kontakta', 'boka', 'kom igång', 'skriv till', 'hör av', 'hör av dig',
  'get started', 'ring oss', 'offert', 'prata med', 'boka ett möte',
]

const SOCIAL_PROOF_TRUSTED_WIDGETS = [
  'trustpilot.com', 'widget.trustpilot', 'google.com/maps/embed',
  'elfsight', 'reviews.io', 'feefo.com', 'judge.me'
]

const SOCIAL_PROOF_SCHEMA_TYPES = [
  'Review', 'AggregateRating', 'Testimonial'
]

const SOCIAL_PROOF_STRONG_WORDS = [
  'omdöme', 'recension', 'review', 'testimonial', 'rekommenderar', 'certifi', 'award', 'nöjd kund',
  'förtroende', 'vi har hjälpt', 'våra kunder', 'kunder som', 'case study', 'referens',
]

const STAR_RATING_REGEX = /(\d[.,]\d)\s*(av|of|\/)\s*5|★{3,}|☆{3,}/i

// Matchar svenska och vanliga internationella format
const PHONE_REGEX = /(\+\d{1,3}[\s-]?)?([\d][\s-]?){6,14}\d|\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/

function detectCtaScore($: cheerio.CheerioAPI): number {
  // 1. Starka knappord
  const ctaTexts: string[] = []
  $('button, a, input[type="submit"]').each((_, el) => {
    const text = $(el).text().toLowerCase().trim()
    if (text) ctaTexts.push(text)
  })
  const combined = ctaTexts.join(' ')
  if (STRONG_CTA_WORDS.some(word => combined.includes(word))) return 2

  // 2. Sektion med CTA-klassnamn/ID som innehåller en knapp eller länk
  let foundCtaSection = false
  $('section, div, article').each((_, el) => {
    const cls = ($(el).attr('class') ?? '').toLowerCase()
    const id = ($(el).attr('id') ?? '').toLowerCase()
    if (CTA_SECTION_CLASS_REGEX.test(cls + ' ' + id)) {
      const hasButton = $(el).find('button, a, input[type="submit"]').length > 0
      if (hasButton) {
        foundCtaSection = true
      }
    }
  })
  if (foundCtaSection) return 2

  // 3. Rubrik med CTA-ord nära en knapp i samma container
  let foundHeadingCta = false
  $('h1, h2, h3').each((_, el) => {
    const headingText = $(el).text().toLowerCase()
    if (CTA_HEADING_WORDS.some(w => headingText.includes(w))) {
      const parent = $(el).parent()
      const hasButton = parent.find('button, a[href], input[type="submit"]').length > 0
      if (hasButton) {
        foundHeadingCta = true
      }
    }
  })
  if (foundHeadingCta) return 2

  // 4. Formulär med namn + e-post = lead/kontakt-formulär med implicit CTA
  let foundLeadForm = false
  $('form').each((_, el) => {
    const form = $(el)
    const hasEmail = form.find('input[type="email"], input[name*="email"], input[name*="mail"], input[placeholder*="e-post"], input[placeholder*="email"]').length > 0
    const hasName = form.find('input[name*="name"], input[name*="namn"], input[placeholder*="namn"], input[placeholder*="name"], input[placeholder*="Namn"]').length > 0
    if (hasEmail && hasName) {
      foundLeadForm = true
    }
  })
  if (foundLeadForm) return 2

  if (WEAK_CTA_WORDS.some(word => combined.includes(word))) return 1
  return 0
}

function detectContactForm($: cheerio.CheerioAPI): boolean {
  let found = false
  $('form').each((_, el) => {
    const form = $(el)

    // Uteslut sökformulär
    const hasSearchInput = form.find('input[type="search"], input[name*="search"], input[name*="q"], input[placeholder*="sök"], input[placeholder*="search"]').length > 0
    if (hasSearchInput) return

    // Uteslut nyhetsbrev (bara en e-postinput utan namnfält)
    const inputs = form.find('input[type="text"], input[type="email"], input[type="tel"], textarea')
    const hasOnlyEmail = inputs.length === 1 && form.find('input[type="email"]').length === 1 && form.find('textarea').length === 0
    if (hasOnlyEmail) return

    // Kontaktformulär har oftast namn, meddelande eller telefon
    const hasMessageField = form.find('textarea').length > 0
    const hasNameField = form.find('input[name*="name"], input[name*="namn"], input[placeholder*="namn"], input[placeholder*="name"]').length > 0
    const hasMultipleFields = inputs.length >= 2

    if (hasMessageField || hasNameField || hasMultipleFields) {
      found = true
    }
  })
  return found
}

function detectSocialProof($: cheerio.CheerioAPI): boolean {
  let score = 0

  // 1. Starka signaler — externa widgets och schema-markup (räcker ensamt)
  const allHtml = $.html().toLowerCase()
  if (SOCIAL_PROOF_TRUSTED_WIDGETS.some(w => allHtml.includes(w))) return true
  if (SOCIAL_PROOF_SCHEMA_TYPES.some(t =>
    allHtml.includes(`itemtype="https://schema.org/${t.toLowerCase()}`) ||
    allHtml.includes(`"@type":"${t}`) ||
    allHtml.includes(`"@type": "${t}`)
  )) return true

  // 2. Stjärnbetyg i text (exkludera nav/header/footer)
  const mainText = $('main, article, section, .content, #content, body')
    .not('nav, header, footer')
    .text()
  if (STAR_RATING_REGEX.test(mainText)) score += 2

  // 3. Starka ord i brödtext (exkludera nav/header/footer)
  const mainTextLower = mainText.toLowerCase()
  const strongWordMatches = SOCIAL_PROOF_STRONG_WORDS.filter(w => mainTextLower.includes(w))
  score += strongWordMatches.length

  // 4. Klasser/ID:n med tydliga recensionsmönster
  $('[class], [id]').not('nav, header, footer, nav *, header *, footer *').each((_, el) => {
    const cls = ($(el).attr('class') ?? '').toLowerCase()
    const id = ($(el).attr('id') ?? '').toLowerCase()
    if (/review|testimonial|rating|omdöme|recension/.test(cls + id)) score += 2
  })

  return score >= 2
}

export async function parseHtml(url: string, keyword?: string): Promise<HtmlParseResult> {
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
      metaTitleLength: null,
      metaDescription: null,
      metaDescriptionLength: null,
      h1Count: 0,
      h2Count: 0,
      imagesTotal: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
      hasForms: false,
      hasPhone: false,
      ctaScore: 0,
      hasSocialProof: false,
      hasOpenGraph: false,
      isHttps: url.startsWith('https://'),
      keyword: keyword ?? null,
      keywordInTitle: null,
      keywordInH1: null,
      keywordInMetaDescription: null,
      keywordBodyCount: null,
      fetchError: true,
    }
  }

  const $ = cheerio.load(html)

  const metaTitle = $('title').first().text().trim() || null
  const metaTitleLength = metaTitle ? metaTitle.length : null
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? null
  const metaDescriptionLength = metaDescription ? metaDescription.length : null

  const h1Count = $('h1').length
  const h2Count = $('h2').length

  const images = $('img')
  const imagesTotal = images.length
  let imagesMissingAlt = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined || alt.trim() === '') imagesMissingAlt++
  })

  // Kontrollera telefon innan vi strippar footer (numret kan sitta där)
  const fullBodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const hasPhone = PHONE_REGEX.test(fullBodyText)

  // Räkna ord exklusive nav/header/footer
  $('nav, header, footer, script, style, noscript').remove()
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length

  const hasForms = detectContactForm($)
  const ctaScore = detectCtaScore($)
  const hasSocialProof = detectSocialProof($)

  const hasOpenGraph = Boolean(
    $('meta[property="og:title"]').attr('content') ||
    $('meta[property="og:image"]').attr('content')
  )
  const isHttps = url.startsWith('https://')

  const normalizedKeyword = keyword?.trim().toLowerCase() || null
  let keywordInTitle: boolean | null = null
  let keywordInH1: boolean | null = null
  let keywordInMetaDescription: boolean | null = null
  let keywordBodyCount: number | null = null

  if (normalizedKeyword) {
    keywordInTitle = (metaTitle ?? '').toLowerCase().includes(normalizedKeyword)
    keywordInH1 = $('h1').text().toLowerCase().includes(normalizedKeyword)
    keywordInMetaDescription = metaDescription
      ? metaDescription.toLowerCase().includes(normalizedKeyword)
      : null
    const bodyLower = bodyText.toLowerCase()
    let count = 0
    let pos = 0
    while ((pos = bodyLower.indexOf(normalizedKeyword, pos)) !== -1) {
      count++
      pos += normalizedKeyword.length
    }
    keywordBodyCount = count
  }

  return {
    metaTitle,
    metaTitleLength,
    metaDescription,
    metaDescriptionLength,
    h1Count,
    h2Count,
    imagesTotal,
    imagesMissingAlt,
    wordCount,
    hasForms,
    hasPhone,
    ctaScore,
    hasSocialProof,
    hasOpenGraph,
    isHttps,
    keyword: normalizedKeyword,
    keywordInTitle,
    keywordInH1,
    keywordInMetaDescription,
    keywordBodyCount,
    fetchError: false,
  }
}
