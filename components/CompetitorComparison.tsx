import { type Check, type CompetitorData, type ReportData } from "@/lib/types";

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

const KEYWORD_CHECK_KEYS = [
  "keywordInH1",
  "keywordInTitle",
  "keywordInMetaDescription",
  "keywordInBody",
] as const;

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

function keywordScore(checks: Record<string, Check>): number {
  return KEYWORD_CHECK_KEYS.reduce((sum, key) => {
    const c = checks[key];
    if (!c) return sum;
    if (c.status === "green") return sum + 2;
    if (c.status === "yellow") return sum + 1;
    return sum;
  }, 0);
}

function KeywordCell({ check }: { check: Check | undefined }) {
  if (!check) return <div className="px-4 py-3 text-sm text-slate-300" />;

  const isBody = check.value !== undefined;
  if (isBody) {
    const count = Number(check.value);
    return (
      <div className="px-4 py-3 flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[check.status]}`}
        />
        <span className={`text-sm font-medium ${STATUS_TEXT[check.status]}`}>
          {count === 0 ? "Saknas" : `${count} gång${count > 1 ? "er" : ""}`}
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[check.status]}`}
      />
      <span className={`text-sm font-medium ${STATUS_TEXT[check.status]}`}>
        {check.status === "green" ? "Finns" : "Saknas"}
      </span>
    </div>
  );
}

interface Props {
  report: ReportData;
  competitor: CompetitorData;
}

export default function CompetitorComparison({ report, competitor }: Props) {
  const myHost = shortHost(report.url);
  const theirHost = shortHost(competitor.url);
  const keyword = report.keyword;

  const myKeywordChecks = report.categories.seo.checks;
  const theirKeywordChecks = competitor.categories.seo.checks;
  const hasKeywordData = KEYWORD_CHECK_KEYS.some(
    (k) => myKeywordChecks[k] !== undefined,
  );

  // Sökordssammanfattning
  const myKwScore = keywordScore(myKeywordChecks);
  const theirKwScore = keywordScore(theirKeywordChecks);
  const kwDiff = myKwScore - theirKwScore;

  let keywordSummary: string;
  if (kwDiff > 2) {
    keywordSummary = `Er sida är bättre optimerad för "${keyword}" än ${theirHost}. Ni har fler av de viktiga platserna täckta, vilket ger er en fördel i sökresultaten.`;
  } else if (kwDiff >= 0) {
    keywordSummary = `Er sida och ${theirHost} är ungefär lika optimerade för "${keyword}". Det finns utrymme att ta täten med några riktade förbättringar.`;
  } else if (kwDiff >= -2) {
    keywordSummary = `${theirHost} har ett litet försprång i optimeringen för "${keyword}". Relativt enkla åtgärder kan jämna ut skillnaden.`;
  } else {
    keywordSummary = `${theirHost} är märkbart bättre optimerade för "${keyword}". De har sökordet på fler av de platser Google värderar högt. Det finns tydliga åtgärder ni kan ta för att ta igen försprånget.`;
  }

  // Övergripande sammanfattning
  const scoreDiff = report.score - competitor.score;
  let overallSummary: string;
  if (scoreDiff > 15) {
    overallSummary = `Er sida presterar klart bättre än ${theirHost}, totalt sett (${report.score} vs ${competitor.score}). Ni har en stark grund att bygga vidare på.`;
  } else if (scoreDiff > 0) {
    overallSummary = `Er sida är något starkare än ${theirHost}, totalt sett (${report.score} vs ${competitor.score}), men skillnaden är liten. Rätt prioriteringar kan öka försprånget.`;
  } else if (scoreDiff === 0) {
    overallSummary = `Er sida och ${theirHost} är jämbördiga, totalt sett (${report.score} vs ${competitor.score}). Detaljerna i rapporten visar var ni kan ta ett övertag.`;
  } else if (scoreDiff >= -15) {
    overallSummary = `${theirHost} ligger något före er, totalt sett (${report.score} vs ${competitor.score}). Skillnaden är hanterbar med rätt prioriteringar.`;
  } else {
    overallSummary = `${theirHost} presterar klart bättre, totalt sett (${report.score} vs ${competitor.score}). Det finns flera konkreta åtgärder som kan minska gapet.`;
  }

  return (
    <div className="mb-10 px-5 flex flex-col gap-10">
      {/* Sökordssektion */}
      {keyword && hasKeywordData && (
        <div>
          <h2 className="text-lg font-bold text-black mb-3">
            Sökordsanalys:{" "}
            <span className="font-normal text-slate-600">"{keyword}"</span>
          </h2>
          <div className="bg-white border border-slate-200 rounded-[5px] overflow-hidden mb-3">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
              <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Kontroll
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide truncate">
                {myHost}
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
                {theirHost}
              </div>
            </div>
            {KEYWORD_CHECK_KEYS.map((key) => {
              const myCheck = myKeywordChecks[key];
              const theirCheck = theirKeywordChecks[key];
              if (!myCheck && !theirCheck) return null;
              const label = myCheck?.label ?? theirCheck?.label ?? key;
              return (
                <div
                  key={key}
                  className="grid grid-cols-3 border-b border-slate-100 last:border-0"
                >
                  <div className="px-4 py-3 text-sm text-slate-600 flex items-center">
                    {label}
                  </div>
                  <KeywordCell check={myCheck} />
                  <KeywordCell check={theirCheck} />
                </div>
              );
            })}
          </div>
          <span className="mt-3 text-[16px] text-slate-600 leading-relaxed block">
            {keywordSummary}
          </span>
          <span className="text-xs text-slate-400 leading-relaxed block mt-3">
            SEO påverkas av många fler faktorer än dessa, bland annat
            bakåtlänkar, domänålder, laddningstid och hur väl innehållet matchar
            sökarens avsikt. Den här analysen visar hur väl er sida är optimerad
            på de faktorer vi kan mäta direkt.
          </span>
        </div>
      )}

      {/* Övergripande jämförelse */}
      <div>
        <h2 className="text-lg font-bold text-black mb-3">
          Övergripande jämförelse
        </h2>
        <div className="bg-white border border-slate-200 rounded-[5px] overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
            <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-end">
              Område
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide truncate mb-1">
                {myHost}
              </p>
              <span
                className={`text-2xl font-bold ${scoreColor(report.score)}`}
              >
                {report.score}
              </span>
              <span className="text-xs text-slate-400 ml-0.5">/ 100</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate mb-1">
                {theirHost}
              </p>
              <span
                className={`text-2xl font-bold ${scoreColor(competitor.score)}`}
              >
                {competitor.score}
              </span>
              <span className="text-xs text-slate-400 ml-0.5">/ 100</span>
            </div>
          </div>

          {(["performance", "seo", "conversion"] as const).map((cat) => {
            const myStatus = report.categories[cat].status;
            const theirStatus = competitor.categories[cat].status;
            const myReds = Object.values(report.categories[cat].checks).filter(
              (c) => c.status === "red",
            ).length;
            const theirReds = Object.values(
              competitor.categories[cat].checks,
            ).filter((c) => c.status === "red").length;

            return (
              <div
                key={cat}
                className="grid grid-cols-3 border-b border-slate-100 last:border-0"
              >
                <div className="px-4 py-4 text-sm font-medium text-slate-700 flex items-center">
                  {CATEGORY_LABELS[cat]}
                </div>
                <div className="px-4 py-4 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[myStatus]}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${STATUS_TEXT[myStatus]}`}
                    >
                      {STATUS_LABEL[myStatus]}
                    </p>
                    {myReds > 0 && (
                      <p className="text-xs text-slate-400">
                        {myReds} att åtgärda
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-4 py-4 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[theirStatus]}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${STATUS_TEXT[theirStatus]}`}
                    >
                      {STATUS_LABEL[theirStatus]}
                    </p>
                    {theirReds > 0 && (
                      <p className="text-xs text-slate-400">
                        {theirReds} att åtgärda
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <span className="mt-3 text-[16px] text-slate-600 leading-relaxed block">
          {overallSummary}
        </span>
      </div>
    </div>
  );
}
