interface Props {
  summary: string;
}

export default function ReportSummary({ summary }: Props) {
  return (
    <div className="">
      <p className="text-blue-600 text-base leading-relaxed">{summary}</p>
    </div>
  );
}
