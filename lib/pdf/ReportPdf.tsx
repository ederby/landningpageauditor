import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { type ReportData, type Status, type CategoryResult } from "@/lib/types";

// ─── Färger ────────────────────────────────────────────────────────────────
const C = {
  red: "#590915",
  orange: "#f05924",
  pink: "#f5b8b8",
  beige: "#f3ece0",
  green: "#2d6a4f",
  yellow: "#b5770d",
  lightGrey: "#f0ebe3",
};

// ─── Stilar ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.beige,
    paddingHorizontal: 48,
    paddingVertical: 48,
    fontFamily: "Helvetica",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: C.orange,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.red,
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 9,
    color: C.orange,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 8,
    color: C.red,
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerUrl: {
    fontSize: 10,
    color: C.red,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  headerDate: {
    fontSize: 8,
    color: C.red,
    opacity: 0.5,
    marginTop: 2,
  },

  // Hero-band
  heroBand: {
    backgroundColor: C.red,
    borderRadius: 6,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.beige,
  },
  heroSub: {
    fontSize: 10,
    color: C.pink,
    marginTop: 4,
    maxWidth: 340,
    lineHeight: 1.5,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.beige,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Summary
  summaryBox: {
    backgroundColor: C.lightGrey,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    padding: 14,
    borderRadius: 4,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 8,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 10,
    color: C.red,
    lineHeight: 1.6,
  },

  // Kategorirubrik
  categoryTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.red,
    marginBottom: 8,
    marginTop: 16,
  },

  // Check-rad
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  checkRowEven: {
    backgroundColor: C.lightGrey,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    marginRight: 10,
    flexShrink: 0,
  },
  checkContent: {
    flex: 1,
  },
  checkLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.red,
  },
  checkDesc: {
    fontSize: 8.5,
    color: C.red,
    opacity: 0.7,
    marginTop: 2,
    lineHeight: 1.4,
  },
  checkValue: {
    fontSize: 8,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },

  // Footer
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.orange,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: C.red,
    opacity: 0.5,
  },
  footerCta: {
    fontSize: 9,
    color: C.orange,
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Hjälpfunktioner ────────────────────────────────────────────────────────
function statusColor(status: Status) {
  return status === "green" ? C.green : status === "yellow" ? C.yellow : "#c0392b";
}

function statusLabel(status: Status) {
  return status === "green" ? "Bra" : status === "yellow" ? "Kan förbättras" : "Behöver åtgärd";
}

function categoryName(key: string) {
  return key === "performance"
    ? "Prestanda"
    : key === "seo"
    ? "SEO"
    : "Konvertering";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Komponenter ────────────────────────────────────────────────────────────
function CategorySection({
  title,
  result,
}: {
  title: string;
  result: CategoryResult;
}) {
  const checks = Object.values(result.checks);
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
        <View style={[s.checkDot, { width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor(result.status), marginRight: 8, marginTop: 0 }]} />
        <Text style={s.categoryTitle}>{title}</Text>
      </View>
      {checks.map((check, i) => (
        <View key={i} style={[s.checkRow, i % 2 === 0 ? s.checkRowEven : {}]}>
          <View style={[s.checkDot, { backgroundColor: statusColor(check.status) }]} />
          <View style={s.checkContent}>
            <Text style={s.checkLabel}>{check.label}</Text>
            <Text style={s.checkDesc}>{check.description}</Text>
            {check.value !== undefined && (
              <Text style={s.checkValue}>Värde: {String(check.value)}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Huvud-export ────────────────────────────────────────────────────────────
export function ReportPdf({ report }: { report: ReportData }) {
  return (
    <Document
      title={`Webbplatsrapport – ${report.url}`}
      author="Relativt"
      subject="Landningssideanalys"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brandName}>RELATIVT</Text>
            <Text style={s.brandTagline}>Digital strategi & tillväxt</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Analyserad sajt</Text>
            <Text style={s.headerUrl}>{report.url}</Text>
            <Text style={s.headerDate}>{formatDate(report.timestamp)}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={s.heroBand}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={s.heroTitle}>Webbplatsrapport</Text>
            <Text style={s.heroSub}>{report.leadText}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor(report.overallStatus) }]}>
            <Text style={s.statusBadgeText}>{statusLabel(report.overallStatus)}</Text>
          </View>
        </View>

        {/* Sammanfattning */}
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>Sammanfattning</Text>
          <Text style={s.summaryText}>{report.summary}</Text>
        </View>

        {/* Kategorier */}
        {(Object.entries(report.categories) as [string, CategoryResult][]).map(
          ([key, result]) => (
            <CategorySection
              key={key}
              title={categoryName(key)}
              result={result}
            />
          )
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            © {new Date().getFullYear()} Relativt · relativt.se
          </Text>
          <Text style={s.footerCta}>Boka en kostnadsfri genomgång → relativt.se/kontakt</Text>
        </View>
      </Page>
    </Document>
  );
}
