import { type PageSpeedResult } from "./pagespeed";
import { type HtmlParseResult } from "./htmlParser";
import {
  type ReportData,
  type CategoryResult,
  type Check,
  type Status,
} from "./types";

function categoryStatus(checks: Record<string, Check>): Status {
  const statuses = Object.values(checks).map((c) => c.status);
  if (statuses.includes("red")) return "red";
  if (statuses.includes("yellow")) return "yellow";
  return "green";
}

function overallStatus(cats: {
  performance: CategoryResult;
  seo: CategoryResult;
  conversion: CategoryResult;
}): Status {
  const statuses = [
    cats.performance.status,
    cats.seo.status,
    cats.conversion.status,
  ];
  const redCount = statuses.filter((s) => s === "red").length;
  if (redCount >= 2) return "red";
  if (statuses.includes("red") || statuses.includes("yellow")) return "yellow";
  return "green";
}

function buildPerformanceChecks(ps: PageSpeedResult): Record<string, Check> {
  const checks: Record<string, Check> = {};

  // loadTime based on tti
  const ttiRounded = ps.tti.toFixed(1);
  if (ps.tti > 3) {
    checks.loadTime = {
      status: "red",
      label: "Laddningstid",
      description: `Sidan laddar på ${ttiRounded}s. 53% av mobilbesökare lämnar en sida som tar mer än 3 sekunder, det innebär att mer än hälften av era potentiella kunder aldrig ser ert erbjudande.`,
      value: ps.tti,
    };
  } else if (ps.tti >= 2) {
    checks.loadTime = {
      status: "yellow",
      label: "Laddningstid",
      description: `Sidan laddar på ${ttiRounded}s. Det är godkänt men inte bra. Under 2 sekunder är målet för sidor som ska konvertera.`,
      value: ps.tti,
    };
  } else {
    checks.loadTime = {
      status: "green",
      label: "Laddningstid",
      description: `Sidan laddar snabbt (${ttiRounded}s). Bra, det påverkar både upplevelse och Google-ranking positivt.`,
      value: ps.tti,
    };
  }

  // mobileScore based on performanceScore
  if (ps.performanceScore < 50) {
    checks.mobileScore = {
      status: "red",
      label: "Mobilupplevelse",
      description: `Mobilupplevelsen är bristfällig (${ps.performanceScore}/100). Över 60% av svenska webbbesökare använder mobil. En stor del av era besökare ser troligtvis en trasig eller svårnavigerad sida.`,
      value: ps.performanceScore,
    };
  } else if (ps.performanceScore < 80) {
    checks.mobileScore = {
      status: "yellow",
      label: "Mobilupplevelse",
      description: `Mobilupplevelsen är acceptabel men har tydliga brister (${ps.performanceScore}/100). Det finns utrymme att förbättra den.`,
      value: ps.performanceScore,
    };
  } else {
    checks.mobileScore = {
      status: "green",
      label: "Mobilupplevelse",
      description: `Sidan fungerar bra på mobil (${ps.performanceScore}/100).`,
      value: ps.performanceScore,
    };
  }

  return checks;
}

function buildSeoChecks(html: HtmlParseResult): Record<string, Check> {
  const checks: Record<string, Check> = {};

  checks.metaTitle =
    html.metaTitle === null
      ? {
          status: "red",
          label: "Titel-tagg",
          description:
            "Sidan saknar en titel-tagg. Det är det första Google läser för att förstå vad sidan handlar om. Utan den riskerar sidan att rankas fel eller inte alls.",
        }
      : {
          status: "green",
          label: "Titel-tagg",
          description: "Sidan har en metatitel.",
          value: html.metaTitle,
        };

  checks.metaDescription =
    html.metaDescription === null
      ? {
          status: "red",
          label: "Metabeskrivning",
          description:
            "Sidan saknar metabeskrivning. Det är texten som syns under er länk i Google. Utan den väljer Google en slumpmässig mening, som sällan är övertygande.",
        }
      : {
          status: "green",
          label: "Metabeskrivning",
          description: "Sidan har en metabeskrivning.",
          value: html.metaDescription,
        };

  if (html.h1Count === 0) {
    checks.h1 = {
      status: "red",
      label: "H1-rubrik",
      description:
        "Sidan har ingen H1-rubrik. Det är sidans viktigaste rubrik, både för besökaren och för Google.",
    };
  } else if (html.h1Count > 1) {
    checks.h1 = {
      status: "red",
      label: "H1-rubrik",
      description: `Sidan har ${html.h1Count} H1-rubriker. Det ska bara finnas en. Flera H1:or förvirrar Google om vad sidan faktiskt handlar om.`,
      value: html.h1Count,
    };
  } else {
    checks.h1 = {
      status: "green",
      label: "H1-rubrik",
      description: "Sidan har en korrekt H1-rubrik.",
    };
  }

  if (html.imagesTotal > 0) {
    const missingRatio = html.imagesMissingAlt / html.imagesTotal;
    if (missingRatio > 0.3) {
      checks.imageAltTexts = {
        status: "red",
        label: "Alt-texter på bilder",
        description: `${html.imagesMissingAlt} av ${html.imagesTotal} bilder saknar alt-text. Det påverkar både tillgänglighet och hur Google indexerar sidans innehåll.`,
        value: html.imagesMissingAlt,
      };
    } else if (html.imagesMissingAlt > 0) {
      checks.imageAltTexts = {
        status: "yellow",
        label: "Alt-texter på bilder",
        description: `${html.imagesMissingAlt} av ${html.imagesTotal} bilder saknar alt-text.`,
        value: html.imagesMissingAlt,
      };
    } else {
      checks.imageAltTexts = {
        status: "green",
        label: "Alt-texter på bilder",
        description: "Alla bilder har alt-texter.",
      };
    }
  }

  return checks;
}

function buildConversionChecks(html: HtmlParseResult): Record<string, Check> {
  const checks: Record<string, Check> = {};

  if (html.ctaScore === 0) {
    checks.ctaScore = {
      status: "red",
      label: "Call-to-action",
      description:
        "Vi hittade ingen tydlig uppmaning att ta kontakt eller ta nästa steg. Besökare som är intresserade vet inte vad de ska göra och lämnar.",
    };
  } else if (html.ctaScore === 1) {
    checks.ctaScore = {
      status: "yellow",
      label: "Call-to-action",
      description:
        "Sidan har en viss uppmaning till handling men den är inte tillräckligt tydlig eller framträdande.",
    };
  } else {
    checks.ctaScore = {
      status: "green",
      label: "Call-to-action",
      description: "Sidan har synliga och tydliga call-to-actions.",
    };
  }

  checks.contactForm = html.hasForms
    ? {
        status: "green",
        label: "Kontaktformulär",
        description: "Sidan har ett kontaktformulär.",
      }
    : {
        status: "red",
        label: "Kontaktformulär",
        description:
          "Det finns inget kontaktformulär på sidan. Det är den lägsta tröskelåtgärden för en besökare som inte vill ringa, utan det förlorar ni troligtvis leads varje dag.",
      };

  checks.socialProof = html.hasSocialProof
    ? {
        status: "green",
        label: "Socialt bevis",
        description: "Sidan visar socialt bevis.",
      }
    : {
        status: "red",
        label: "Socialt bevis",
        description:
          "Sidan innehåller inga synliga omdömen, kundlogotyper eller resultat. Socialt bevis är en av de starkaste konverteringsfaktorerna, utan det måste besökaren lita blint på ert erbjudande.",
      };

  if (html.wordCount < 150) {
    checks.wordCount = {
      status: "red",
      label: "Innehållsmängd",
      description: `Sidan innehåller ungefär ${html.wordCount} ord. Det räcker inte för att förklara vad ni erbjuder, till vem och varför just ni. Tunna sidor konverterar sämre och rankar sämre i Google.`,
      value: html.wordCount,
    };
  } else if (html.wordCount <= 300) {
    checks.wordCount = {
      status: "yellow",
      label: "Innehållsmängd",
      description: `Sidan har ett visst innehåll (${html.wordCount} ord) men det finns utrymme att kommunicera erbjudandet tydligare.`,
      value: html.wordCount,
    };
  } else {
    checks.wordCount = {
      status: "green",
      label: "Innehållsmängd",
      description: `Sidan har tillräckligt med innehåll (${html.wordCount} ord) för att kommunicera erbjudandet.`,
      value: html.wordCount,
    };
  }

  checks.phoneNumber = html.hasPhone
    ? {
        status: "green",
        label: "Telefonnummer",
        description: "Sidan visar ett telefonnummer.",
      }
    : {
        status: "red",
        label: "Telefonnummer",
        description:
          "Inget telefonnummer är synligt. Besökare som vill ha snabbt svar ger upp om de inte hittar ett nummer.",
      };

  return checks;
}

export function generateReport(
  url: string,
  ps: PageSpeedResult,
  html: HtmlParseResult,
): ReportData {
  const perfChecks = buildPerformanceChecks(ps);
  const seoChecks = buildSeoChecks(html);
  const convChecks = buildConversionChecks(html);

  const performance: CategoryResult = {
    status: categoryStatus(perfChecks),
    checks: perfChecks,
  };
  const seo: CategoryResult = {
    status: categoryStatus(seoChecks),
    checks: seoChecks,
  };
  const conversion: CategoryResult = {
    status: categoryStatus(convChecks),
    checks: convChecks,
  };

  const categories = { performance, seo, conversion };
  const overall = overallStatus(categories);

  const allChecks = [
    ...Object.values(perfChecks),
    ...Object.values(seoChecks),
    ...Object.values(convChecks),
  ];
  const redCount = allChecks.filter((c) => c.status === "red").length;

  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  let summary: string;
  if (redCount <= 1) {
    summary = `${hostname} ser generellt bra ut, men det finns förbättringsområden som kan öka antalet leads. Se rapport nedan. Vi kan hjälpa er att identifiera, prioritera och åtgärda dessa förbättringsområden så att er webbplats presterar bättre och genererar fler konverteringar.`;
  } else if (redCount <= 4) {
    summary = `${hostname} har ett antal konkreta problem som troligtvis kostar er kunder varje dag. Se rapport nedan. Vi kan hjälpa er att identifiera, prioritera och åtgärda dessa problem så att er webbplats presterar bättre och genererar fler konverteringar.`;
  } else {
    summary = `${hostname} har allvarliga brister inom flera områden. Se rapport nedan. Vi kan hjälpa er att identifiera, prioritera och åtgärda dessa problem så att er webbplats presterar bättre och genererar fler konverteringar.`;
  }

  const leadText =
    "Vi på Relativt hjälper företag att bygga webbsidor och landningssidor som faktiskt genererar kunder. Vill du att vi tittar på er sajt och berättar vad som behöver åtgärdas?";

  return {
    url,
    timestamp: new Date().toISOString(),
    overallStatus: overall,
    categories,
    summary,
    leadText,
  };
}
