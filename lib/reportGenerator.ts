import { type PageSpeedResult } from "./pagespeed";
import { type HtmlParseResult } from "./htmlParser";
import {
  type ReportData,
  type CategoryResult,
  type Check,
  type Status,
} from "./types";

function calculateScore(categories: {
  performance: CategoryResult
  seo: CategoryResult
  conversion: CategoryResult
}): number {
  const allChecks = [
    ...Object.values(categories.performance.checks),
    ...Object.values(categories.seo.checks),
    ...Object.values(categories.conversion.checks),
  ]
  const points = allChecks.reduce((sum, check) => {
    if (check.status === 'green') return sum + 2
    if (check.status === 'yellow') return sum + 1
    return sum
  }, 0)
  return Math.round((points / (allChecks.length * 2)) * 100)
}

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

  // LCP — Largest Contentful Paint (primärt Core Web Vital för laddning)
  const lcpRounded = ps.lcp.toFixed(1);
  if (ps.lcp > 4) {
    checks.lcp = {
      status: "red",
      label: "Laddningstid (LCP)",
      description: `Sidans huvudinnehåll laddas på ${lcpRounded}s. Google sätter gränsen vid 2,5s. Er sida är mer än dubbelt så långsam, vilket påverkar både ranking och att besökare lämnar sidan.`,
      value: `${lcpRounded}s`,
    };
  } else if (ps.lcp > 2.5) {
    checks.lcp = {
      status: "yellow",
      label: "Laddningstid (LCP)",
      description: `Sidans huvudinnehåll laddas på ${lcpRounded}s. Google rekommenderar under 2,5s för en bra upplevelse.`,
      value: `${lcpRounded}s`,
    };
  } else {
    checks.lcp = {
      status: "green",
      label: "Laddningstid (LCP)",
      description: `Sidans huvudinnehåll laddas snabbt (${lcpRounded}s). Under Googles gräns på 2,5s.`,
      value: `${lcpRounded}s`,
    };
  }

  // TBT — Total Blocking Time (trög interaktivitet)
  if (ps.tbt > 600) {
    checks.tbt = {
      status: "red",
      label: "Interaktivitet (TBT)",
      description: `Sidan blockerar webbläsaren i ${ps.tbt}ms. Det innebär att klick och knapptryck inte svarar direkt. Besökare upplever sidan som fryst.`,
      value: `${ps.tbt}ms`,
    };
  } else if (ps.tbt > 200) {
    checks.tbt = {
      status: "yellow",
      label: "Interaktivitet (TBT)",
      description: `Sidan har en viss fördröjning i interaktivitet (${ps.tbt}ms). Under 200ms är målet.`,
      value: `${ps.tbt}ms`,
    };
  } else {
    checks.tbt = {
      status: "green",
      label: "Interaktivitet (TBT)",
      description: `Sidan svarar snabbt på interaktion (${ps.tbt}ms).`,
      value: `${ps.tbt}ms`,
    };
  }

  // Mobilupplevelse — performanceScore + isMobileFriendly
  if (!ps.isMobileFriendly) {
    checks.mobileScore = {
      status: "red",
      label: "Mobilupplevelse",
      description: `Sidan är inte anpassad för mobil. Över 60% av svenska webbbesökare använder mobil och ser troligtvis en kraftigt inzoomad eller trasig layout.`,
      value: ps.performanceScore,
    };
  } else if (ps.performanceScore < 50) {
    checks.mobileScore = {
      status: "red",
      label: "Mobilupplevelse",
      description: `Mobilupplevelsen är bristfällig (${ps.performanceScore}/100). Sidan är responsiv men presterar dåligt på mobila enheter.`,
      value: ps.performanceScore,
    };
  } else if (ps.performanceScore < 80) {
    checks.mobileScore = {
      status: "yellow",
      label: "Mobilupplevelse",
      description: `Mobilupplevelsen är acceptabel men har tydliga brister (${ps.performanceScore}/100).`,
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

  // CLS — Cumulative Layout Shift (hoppar element runt?)
  const clsRounded = ps.cls.toFixed(2)
  if (ps.cls > 0.25) {
    checks.cls = {
      status: 'red',
      label: 'Layoutstabilitet',
      description: `Sidan hoppar runt när den laddas (${clsRounded}). Element flyttar sig medan besökaren försöker klicka, vilket skapar frustration och kostar konverteringar.`,
      value: clsRounded,
    }
  } else if (ps.cls > 0.1) {
    checks.cls = {
      status: 'yellow',
      label: 'Layoutstabilitet',
      description: `Sidan rör sig lite när den laddas (${clsRounded}). Googles rekommendation är under 0,1.`,
      value: clsRounded,
    }
  } else {
    checks.cls = {
      status: 'green',
      label: 'Layoutstabilitet',
      description: `Sidan är stabil när den laddas (${clsRounded}).`,
      value: clsRounded,
    }
  }

  return checks;
}

function buildSeoChecks(html: HtmlParseResult): Record<string, Check> {
  const checks: Record<string, Check> = {};

  // Titel-tagg — existens och längd (30–60 tecken är optimalt)
  if (html.metaTitle === null) {
    checks.metaTitle = {
      status: "red",
      label: "Titel-tagg",
      description:
        "Sidan saknar en titel-tagg. Det är det första Google läser. Utan den riskerar sidan att rankas fel eller inte alls.",
    };
  } else if (html.metaTitleLength !== null && html.metaTitleLength < 30) {
    checks.metaTitle = {
      status: "yellow",
      label: "Titel-tagg",
      description: `Titeln är för kort (${html.metaTitleLength} tecken). En bra titel är 30–60 tecken och beskriver tydligt vad sidan erbjuder.`,
      value: html.metaTitle,
    };
  } else if (html.metaTitleLength !== null && html.metaTitleLength > 60) {
    checks.metaTitle = {
      status: "yellow",
      label: "Titel-tagg",
      description: `Titeln är för lång (${html.metaTitleLength} tecken) och kapas i sökresultaten. Håll den under 60 tecken.`,
      value: html.metaTitle,
    };
  } else {
    checks.metaTitle = {
      status: "green",
      label: "Titel-tagg",
      description: `Sidan har en välformulerad titel (${html.metaTitleLength} tecken).`,
      value: html.metaTitle,
    };
  }

  // Metabeskrivning — existens och längd (120–160 tecken är optimalt)
  if (html.metaDescription === null) {
    checks.metaDescription = {
      status: "red",
      label: "Metabeskrivning",
      description:
        "Sidan saknar metabeskrivning. Det är texten som syns under er länk i Google. Utan den väljer Google en slumpmässig mening som sällan är övertygande.",
    };
  } else if (html.metaDescriptionLength !== null && html.metaDescriptionLength < 80) {
    checks.metaDescription = {
      status: "yellow",
      label: "Metabeskrivning",
      description: `Metabeskrivningen är för kort (${html.metaDescriptionLength} tecken). Sikta på 120–160 tecken för att fylla hela utrymmet i sökresultaten.`,
      value: html.metaDescription,
    };
  } else if (html.metaDescriptionLength !== null && html.metaDescriptionLength > 160) {
    checks.metaDescription = {
      status: "yellow",
      label: "Metabeskrivning",
      description: `Metabeskrivningen är för lång (${html.metaDescriptionLength} tecken) och kapas i sökresultaten. Håll den under 160 tecken.`,
      value: html.metaDescription,
    };
  } else {
    checks.metaDescription = {
      status: "green",
      label: "Metabeskrivning",
      description: `Sidan har en bra metabeskrivning (${html.metaDescriptionLength} tecken).`,
      value: html.metaDescription,
    };
  }

  // H1-rubrik
  if (html.h1Count === 0) {
    checks.h1 = {
      status: "red",
      label: "H1-rubrik",
      description:
        "Sidan har ingen H1-rubrik. Det är sidans viktigaste rubrik, för både besökaren och Google.",
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

  // HTTPS
  if (!html.isHttps) {
    checks.https = {
      status: 'red',
      label: 'Säker anslutning (HTTPS)',
      description: 'Sidan är inte krypterad. Webbläsare visar "Inte säker" för besökarna, vilket sänker förtroendet omedelbart. Google rankar dessutom HTTPS-sidor högre.',
    }
  } else {
    checks.https = {
      status: 'green',
      label: 'Säker anslutning (HTTPS)',
      description: 'Sidan är krypterad och säker.',
    }
  }

  // Open Graph — hur sidan ser ut vid delning på sociala medier
  if (!html.hasOpenGraph) {
    checks.openGraph = {
      status: 'yellow',
      label: 'Delning i sociala medier',
      description: 'Sidan saknar inställningar för hur den visas när den delas på LinkedIn, Facebook eller i Slack. Utan det visas delningar utan bild och med en generisk rubrik, vilket ger ett oprofessionellt intryck och färre klick.',
    }
  } else {
    checks.openGraph = {
      status: 'green',
      label: 'Delning i sociala medier',
      description: 'Sidan är korrekt inställd för delning i sociala medier.',
    }
  }

  // Sökordsanalys — visas bara om användaren angett ett sökord
  if (html.keyword) {
    const kw = `"${html.keyword}"`;

    checks.keywordInH1 = html.keywordInH1
      ? {
          status: 'green',
          label: 'Sökord i rubrik (H1)',
          description: `Sökordet ${kw} finns i sidans huvudrubrik.`,
        }
      : {
          status: 'red',
          label: 'Sökord i rubrik (H1)',
          description: `Sökordet ${kw} saknas i sidans huvudrubrik. Det är en av de viktigaste platserna för Google att förstå vad sidan handlar om.`,
        };

    checks.keywordInTitle = html.keywordInTitle
      ? {
          status: 'green',
          label: 'Sökord i titel-tagg',
          description: `Sökordet ${kw} finns i titel-taggen.`,
        }
      : {
          status: 'yellow',
          label: 'Sökord i titel-tagg',
          description: `Sökordet ${kw} saknas i titel-taggen. Titel-taggen är en av de starkaste SEO-signalerna och bör innehålla det viktigaste sökordet.`,
        };

    if (html.keywordInMetaDescription !== null) {
      checks.keywordInMetaDescription = html.keywordInMetaDescription
        ? {
            status: 'green',
            label: 'Sökord i metabeskrivning',
            description: `Sökordet ${kw} finns i metabeskrivningen.`,
          }
        : {
            status: 'yellow',
            label: 'Sökord i metabeskrivning',
            description: `Sökordet ${kw} saknas i metabeskrivningen. Att ha med det ökar klickfrekvensen från sökresultaten.`,
          };
    }

    const count = html.keywordBodyCount ?? 0;
    if (count === 0) {
      checks.keywordInBody = {
        status: 'red',
        label: 'Sökord i texten',
        description: `Sökordet ${kw} förekommer inte i sidans text. Google kan inte avgöra vad sidan handlar om.`,
        value: 0,
      };
    } else if (count <= 2) {
      checks.keywordInBody = {
        status: 'yellow',
        label: 'Sökord i texten',
        description: `Sökordet ${kw} förekommer bara ${count} gång${count > 1 ? 'er' : ''} i texten. Sikta på minst 3 förekomster för en tydligare SEO-signal.`,
        value: count,
      };
    } else {
      checks.keywordInBody = {
        status: 'green',
        label: 'Sökord i texten',
        description: `Sökordet ${kw} förekommer ${count} gånger i texten.`,
        value: count,
      };
    }
  }

  // Alt-texter
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

  // CTA
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

  // Kontaktformulär
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
          "Det finns inget kontaktformulär på sidan. Det är det enklaste sättet för besökare att höra av sig utan att ringa. Utan det förlorar ni troligtvis leads varje dag.",
      };

  // Socialt bevis
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
          "Sidan innehåller inga synliga omdömen, kundlogotyper eller resultat. Socialt bevis är en av de starkaste konverteringsfaktorerna. Utan det måste besökaren lita blint på ert erbjudande.",
      };

  // Innehållsmängd
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

  // Telefonnummer
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
    score: calculateScore(categories),
    keyword: html.keyword,
    overallStatus: overall,
    categories,
    summary,
    leadText,
  };
}
