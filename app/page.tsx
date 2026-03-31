'use client'

import { useState } from 'react'
import AnalyzerForm from '@/components/AnalyzerForm'
import ReportHeader from '@/components/ReportHeader'
import ScoreCard from '@/components/ScoreCard'
import CheckItem from '@/components/CheckItem'
import ReportSummary from '@/components/ReportSummary'
import LeadCTA from '@/components/LeadCTA'
import { type ReportData } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  performance: 'Prestanda',
  seo: 'SEO',
  conversion: 'Konvertering',
}

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null)

  function handleReset() {
    setReport(null)
  }

  if (report) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-800 mb-8 flex items-center gap-1.5"
          >
            ← Analysera en annan sajt
          </button>

          <div className="mb-8">
            <ReportHeader report={report} />
          </div>

          <div className="mb-8">
            <ReportSummary summary={report.summary} />
          </div>

          <div className="mb-10">
            <ScoreCard
              performance={report.categories.performance}
              seo={report.categories.seo}
              conversion={report.categories.conversion}
            />
          </div>

          {(['performance', 'seo', 'conversion'] as const).map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-3">{CATEGORY_LABELS[cat]}</h2>
              <div className="bg-white border border-slate-200 rounded-xl px-5 divide-y divide-slate-100">
                {Object.entries(report.categories[cat].checks).map(([key, check]) => (
                  <CheckItem key={key} checkKey={key} check={check} />
                ))}
              </div>
            </div>
          ))}

          <LeadCTA report={report} />
        </div>

        <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
          <a href="https://relativt.se" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">
            relativt.se
          </a>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-xl text-center">
          <p className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Relativt</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
            Varför genererar din webbplats inga kunder?
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Klistra in din URL nedan. Du får en gratis rapport inom 10 sekunder.
          </p>
          <AnalyzerForm onReport={setReport} />
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <a href="https://relativt.se" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">
          relativt.se
        </a>
      </footer>
    </div>
  )
}
