interface Props {
  summary: string
}

export default function ReportSummary({ summary }: Props) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
      <p className="text-slate-700 text-base leading-relaxed">{summary}</p>
    </div>
  )
}
