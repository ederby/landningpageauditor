'use client'

import { useState, type FormEvent } from 'react'
import { type ReportData } from '@/lib/types'

interface Props {
  report: ReportData
}

export default function LeadCTA({ report }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailError(null)
    if (!email || !email.includes('@')) {
      setEmailError('Ange en giltig e-postadress.')
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url: report.url }),
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl px-8 py-10 text-white">
      <h2 className="text-2xl font-bold mb-3">Vill ni ha hjälp att åtgärda detta?</h2>
      <p className="text-slate-300 text-base mb-8 max-w-xl leading-relaxed">{report.leadText}</p>
      <a
        href="https://relativt.se/kontakt"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-7 py-3.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-base"
      >
        Boka en kostnadsfri genomgång
      </a>

      <div className="mt-10 pt-8 border-t border-slate-700">
        <p className="text-slate-400 text-sm mb-3">Få rapporten som PDF — ange din e-post</p>
        {submitted ? (
          <p className="text-emerald-400 text-sm font-medium">Tack! Vi hör av oss.</p>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.se"
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {submitting ? 'Skickar...' : 'Skicka rapport'}
            </button>
          </form>
        )}
        {emailError && <p className="mt-2 text-red-400 text-xs">{emailError}</p>}
      </div>
    </div>
  )
}
