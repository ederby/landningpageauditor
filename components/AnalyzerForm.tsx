'use client'

import { useState, type FormEvent } from 'react'
import { type ReportData } from '@/lib/types'
import LoadingState from './LoadingState'

interface Props {
  onReport: (report: ReportData) => void
}

export default function AnalyzerForm({ onReport }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    let normalized = url.trim()
    if (!normalized) {
      setError('Ange en URL.')
      return
    }
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized
    }

    try {
      new URL(normalized)
    } catch {
      setError('URL:en verkar inte vara giltig. Kontrollera och försök igen.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Något gick fel. Försök igen.')
        return
      }
      onReport(data as ReportData)
    } catch {
      setError('Kunde inte nå servern. Kontrollera din internetanslutning.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://dittforetag.se"
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap text-base"
        >
          Analysera min sajt
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}
