import { type CategoryResult } from '@/lib/types'

interface CardProps {
  title: string
  result: CategoryResult
}

const STATUS_DOT = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
}

const STATUS_BORDER = {
  red: 'border-red-200',
  yellow: 'border-amber-200',
  green: 'border-emerald-200',
}

function Card({ title, result }: CardProps) {
  const checks = Object.values(result.checks)
  const reds = checks.filter(c => c.status === 'red').length
  const yellows = checks.filter(c => c.status === 'yellow').length
  const greens = checks.filter(c => c.status === 'green').length

  return (
    <div className={`flex-1 rounded-xl border-2 ${STATUS_BORDER[result.status]} bg-white p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[result.status]}`} />
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="flex gap-3 text-sm">
        {reds > 0 && (
          <span className="flex items-center gap-1.5 text-red-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {reds} åtgärda
          </span>
        )}
        {yellows > 0 && (
          <span className="flex items-center gap-1.5 text-amber-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {yellows} förbättra
          </span>
        )}
        {greens > 0 && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {greens} ok
          </span>
        )}
      </div>
    </div>
  )
}

interface Props {
  performance: CategoryResult
  seo: CategoryResult
  conversion: CategoryResult
}

export default function ScoreCard({ performance, seo, conversion }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Card title="Prestanda" result={performance} />
      <Card title="SEO" result={seo} />
      <Card title="Konvertering" result={conversion} />
    </div>
  )
}
