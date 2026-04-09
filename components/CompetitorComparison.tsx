import { type CompetitorData, type ReportData } from "@/lib/types";

const STATUS_DOT: Record<string, string> = {
  red: "bg-red-500",
  yellow: "bg-amber-500",
  green: "bg-emerald-500",
};

const STATUS_TEXT: Record<string, string> = {
  red: "text-red-600",
  yellow: "text-amber-600",
  green: "text-emerald-600",
};

const STATUS_LABEL = {
  green: "Bra",
  yellow: "Förbättringsområden",
  red: "Kritiska brister",
};

const CATEGORY_LABELS = {
  performance: "Prestanda",
  seo: "SEO",
  conversion: "Konvertering",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function shortHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface Props {
  report: ReportData;
  competitor: CompetitorData;
}

export default function CompetitorComparison({ report, competitor }: Props) {
  const myHost = shortHost(report.url);
  const theirHost = shortHost(competitor.url);

  return (
    <div className="mb-8 px-5">
      <h2 className="text-lg font-bold text-black mb-3">
        Jämförelse med konkurrent
      </h2>
      <div className="bg-white border border-slate-200 rounded-[5px] overflow-hidden">
        {/* Header med poäng */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
          <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-end">
            Område
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide truncate mb-1">
              {myHost}
            </p>
            <span className={`text-2xl font-bold ${scoreColor(report.score)}`}>
              {report.score}
            </span>
            <span className="text-xs text-slate-400 ml-0.5">/ 100</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate mb-1">
              {theirHost}
            </p>
            <span className={`text-2xl font-bold ${scoreColor(competitor.score)}`}>
              {competitor.score}
            </span>
            <span className="text-xs text-slate-400 ml-0.5">/ 100</span>
          </div>
        </div>

        {(["performance", "seo", "conversion"] as const).map((cat) => {
          const myStatus = report.categories[cat].status;
          const theirStatus = competitor.categories[cat].status;
          const myReds = Object.values(report.categories[cat].checks).filter(
            (c) => c.status === "red"
          ).length;
          const theirReds = Object.values(competitor.categories[cat].checks).filter(
            (c) => c.status === "red"
          ).length;

          return (
            <div
              key={cat}
              className="grid grid-cols-3 border-b border-slate-100 last:border-0"
            >
              <div className="px-4 py-4 text-sm font-medium text-slate-700 flex items-center">
                {CATEGORY_LABELS[cat]}
              </div>
              <div className="px-4 py-4 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[myStatus]}`} />
                <div>
                  <p className={`text-sm font-medium ${STATUS_TEXT[myStatus]}`}>
                    {STATUS_LABEL[myStatus]}
                  </p>
                  {myReds > 0 && (
                    <p className="text-xs text-slate-400">{myReds} att åtgärda</p>
                  )}
                </div>
              </div>
              <div className="px-4 py-4 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[theirStatus]}`} />
                <div>
                  <p className={`text-sm font-medium ${STATUS_TEXT[theirStatus]}`}>
                    {STATUS_LABEL[theirStatus]}
                  </p>
                  {theirReds > 0 && (
                    <p className="text-xs text-slate-400">{theirReds} att åtgärda</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
