import { NextRequest, NextResponse } from 'next/server'

// Stub — PDF-generering och e-postutskick är inte implementerat i MVP
export async function POST(req: NextRequest) {
  let body: { email?: string; url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig request.' }, { status: 400 })
  }

  const { email } = body
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Ogiltig e-postadress.' }, { status: 400 })
  }

  // TODO: Implementera e-postutskick och PDF-generering
  return NextResponse.json({ success: true, message: 'Tack! Vi hör av oss.' })
}
