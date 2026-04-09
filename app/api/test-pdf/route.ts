/**
 * ENDAST FÖR LOKAL TESTNING — ta bort innan deploy till produktion.
 * Besök /api/test-pdf i webbläsaren för att ladda ner en test-PDF.
 */
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPdf } from "@/lib/pdf/ReportPdf";
import { type ReportData } from "@/lib/types";
import React from "react";

const mockReport: ReportData = {
  url: "https://exempelforetag.se",
  timestamp: new Date().toISOString(),
  score: 58,
  keyword: null,
  overallStatus: "yellow",
  categories: {
    performance: {
      status: "yellow",
      checks: {
        lcp: {
          status: "yellow",
          label: "Largest Contentful Paint",
          description:
            "Sidans största element laddas in efter 3,2 sekunder — rekommendationen är under 2,5s.",
          value: "3.2s",
        },
        cls: {
          status: "green",
          label: "Cumulative Layout Shift",
          description:
            "Layouten är stabil och förskjuter sig inte under laddning.",
          value: 0.04,
        },
        fid: {
          status: "red",
          label: "First Input Delay",
          description:
            "Hög fördröjning vid första interaktion — kan försämra användarupplevelsen påtagligt.",
          value: "210ms",
        },
      },
    },
    seo: {
      status: "green",
      checks: {
        title: {
          status: "green",
          label: "Sidtitel",
          description:
            "Sidtiteln är välformulerad och innehåller relevanta nyckelord.",
        },
        metaDescription: {
          status: "yellow",
          label: "Metabeskrivning",
          description:
            "Metabeskrivningen är för kort (62 tecken). Sikta på 140–160 tecken.",
          value: "62 tecken",
        },
        h1: {
          status: "green",
          label: "H1-rubrik",
          description:
            "Sidan har exakt en H1-rubrik med tydlig och relevant text.",
        },
      },
    },
    conversion: {
      status: "red",
      checks: {
        cta: {
          status: "red",
          label: "Call to action",
          description:
            "Ingen tydlig CTA hittades ovanför knäcklinjen. Besökare vet inte vart de ska ta vägen.",
        },
        mobileUx: {
          status: "yellow",
          label: "Mobilanpassning",
          description:
            "Sidan är responsiv men knappar är för små för pekskärm (under 44px).",
        },
        trustSignals: {
          status: "red",
          label: "Förtroendesignaler",
          description:
            "Inga recensioner, certifieringar eller kundlogotyper hittades på sidan.",
        },
      },
    },
  },
  summary:
    "Webbplatsen har god SEO-grund men tydliga brister inom konvertering och prestanda. Avsaknaden av en synlig CTA och förtroendesignaler är sannolikt det som kostar mest affärer just nu.",
  leadText:
    "Vi har identifierat flera områden där relativt enkla åtgärder kan ge märkbar effekt. Boka en kostnadsfri genomgång så går vi igenom prioriteringarna tillsammans.",
};

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(ReportPdf, { report: mockReport }) as any,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="test-rapport.pdf"',
    },
  });
}
