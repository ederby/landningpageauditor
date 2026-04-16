"use client";

import { useState } from "react";
import AnalyzerForm from "@/components/AnalyzerForm";
import ReportHeader from "@/components/ReportHeader";
import ScoreCard from "@/components/ScoreCard";
import CheckItem from "@/components/CheckItem";
import ReportSummary from "@/components/ReportSummary";
import LeadCTA from "@/components/LeadCTA";
import CompetitorComparison from "@/components/CompetitorComparison";
import { type ReportData } from "@/lib/types";
import logo from "@/public/relativt-logo.svg";

const CATEGORY_LABELS: Record<string, string> = {
  performance: "Prestanda",
  seo: "SEO",
  conversion: "Konvertering",
};

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);

  function handleReset() {
    setReport(null);
  }

  if (report) {
    return (
      <div className="min-h-screen scroll-smooth">
        <div>
          <div className="bg-beige section-padding flex flex-col justify-center items-center">
            <div className="w-full max-w-240 px-5">
              <div className="mb-[clamp(20px,5px+3.125vw,40px)]">
                <ReportHeader report={report} />
              </div>

              <div className="mb-[clamp(20px,5px+3.125vw,40px)]">
                <ReportSummary summary={report.summary} />
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <a
                  href="#cta-footer"
                  className="sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red text-[clamp(16px,13px+0.625vw,20px)] text-center hover:text-beige border-3 border-orange font-semibold rounded-[5px] transition-colors whitespace-nowrap"
                >
                  Hjälp mig!
                </a>
                <button
                  onClick={handleReset}
                  className="sm:px-5 md:px-17.5 py-4 cursor-pointer text-red text-[clamp(16px,13px+0.625vw,20px)] hover:text-beige border-3 hover:bg-orange border-orange font-semibold rounded-[5px] transition-colors whitespace-nowrap"
                >
                  Analysera en annan sajt
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-240 section-padding mx-auto">
            <div className="mb-10 px-5">
              <ScoreCard
                performance={report.categories.performance}
                seo={report.categories.seo}
                conversion={report.categories.conversion}
              />
            </div>

            {report.competitor && (
              <CompetitorComparison
                report={report}
                competitor={report.competitor}
              />
            )}

            {(["performance", "seo", "conversion"] as const).map((cat) => (
              <div key={cat} className="mb-8 px-5">
                <h2 className="text-lg font-bold text-black mb-3">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="bg-white border border-slate-200 rounded-[5px] px-5 divide-y divide-slate-100">
                  {Object.entries(report.categories[cat].checks).map(
                    ([key, check]) => (
                      <CheckItem key={key} checkKey={key} check={check} />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <LeadCTA report={report} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-red flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="flex  flex-col w-full max-w-200 text-center">
          <h1 className="text-h1 font-bold leading-tight mb-5 text-beige">
            Hur optimerad är din webbplats egentligen?
          </h1>
          <span className="text-beige text-lg mb-10">
            Analysera prestanda, SEO och konvertering och jämför direkt med en
            konkurrent. Perfekt för dig som vill förstå hur din webbplats kan
            bli bättre.
          </span>
          <AnalyzerForm onReport={setReport} />
        </div>
      </main>
    </div>
  );
}
