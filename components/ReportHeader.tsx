import { type ReportData } from "@/lib/types";

const STATUS_CONFIG = {
  red: { label: "Kritiska brister", classes: "bg-red-100 text-red-700" },
  yellow: {
    label: "Förbättringsområden finns",
    classes: "bg-amber-100 text-amber-700 border-amber-700",
  },
  green: { label: "Ser bra ut", classes: "bg-emerald-100 text-emerald-700" },
};

interface Props {
  report: ReportData;
}

export default function ReportHeader({ report }: Props) {
  const status = STATUS_CONFIG[report.overallStatus];
  const date = new Date(report.timestamp);
  const formatted = date.toLocaleString("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
  });

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
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-[5px] text-sm font-semibold border whitespace-nowrap ${status.classes}`}
      >
        {status.label}
      </span>
    </div>
  );
}
