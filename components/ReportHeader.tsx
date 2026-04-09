import { type ReportData } from "@/lib/types";

const SCORE_COLOR = (score: number) => {
  if (score >= 80)
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  if (score >= 50)
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
};

interface Props {
  report: ReportData;
}

export default function ReportHeader({ report }: Props) {
  const date = new Date(report.timestamp);
  const formatted = date.toLocaleString("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const color = SCORE_COLOR(report.score);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <a
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-900 font-semibold text-lg hover:underline break-all"
        >
          {report.url}
        </a>
        <p className="text-red text-sm mt-1">{formatted}</p>
      </div>
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-[5px] border ${color.bg} ${color.border} shrink-0`}
      >
        <span className={`text-3xl font-bold leading-none ${color.text}`}>
          {report.score}
        </span>
        <span className={`text-sm font-medium ${color.text} leading-tight`}>
          / 100
        </span>
      </div>
    </div>
  );
}
