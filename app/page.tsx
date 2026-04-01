"use client";

import { useState } from "react";
import AnalyzerForm from "@/components/AnalyzerForm";
import ReportHeader from "@/components/ReportHeader";
import ScoreCard from "@/components/ScoreCard";
import CheckItem from "@/components/CheckItem";
import ReportSummary from "@/components/ReportSummary";
import LeadCTA from "@/components/LeadCTA";
import { type ReportData } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  performance: "Prestanda",
  seo: "SEO",
  conversion: "Konvertering",
};

export default function Home() {
  const [report, setReport] = useState<ReportData | null>(null);

  console.log(report);

  function handleReset() {
    setReport(null);
  }

  if (report) {
    return (
      <div className="min-h-screen">
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

            {(["performance", "seo", "conversion"] as const).map((cat) => (
              <div key={cat} className="mb-8 px-5">
                <h2 className="text-lg font-bold text-slate-800 mb-3">
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
    <div className="min-h-screen bg-red flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-237.5 text-center">
          <h1 className="text-h1 font-bold leading-tight mb-5 text-beige">
            Varför genererar din webbplats inga kunder?
          </h1>
          <p className="text-beige text-lg mb-10">
            Klistra in din URL nedan. Du får en gratis rapport inom 10 sekunder.
          </p>
          <AnalyzerForm onReport={setReport} />
        </div>
      </main>
    </div>
  );
}
