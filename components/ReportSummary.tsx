interface Props {
  summary: string;
}

export default function ReportSummary({ summary }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-blue-600 text-base leading-relaxed">{summary}</p>
      <span className="text-slate-400 text-[14px] mt-2 leading-relaxed">
        Rapporten analyserar enbart den sida du angav, inte övriga sidor på
        webbplatsen. Den ger en bra överblick men går inte på djupet i alla
        delar. Vill du ha en mer genomgående genomgång?{" "}
        <a
          href="#cta-footer"
          className="underline hover:text-slate-600 transition-colors"
        >
          Kontakta oss.
        </a>
      </span>
    </div>
  );
}
