type PanelTimelineItemProps = {
  title: string;
  detail: string;
  result: string; // ej: "25 / 40"
};

function getResultStyle(score: number) {
  if (score < 20) {
    return {
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  }

  if (score < 30) {
    return {
      text: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    };
  }

  return {
    text: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  };
}

export default function PanelTimelineItem({
  title,
  detail,
  result,
}: PanelTimelineItemProps) {
  // Extraer número de "25 / 40"
  const score = Number(result.split("/")[0].trim()) || 0;

  const style = getResultStyle(score);

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition hover:shadow-sm ${style.bg} ${style.border}`}
    >
      <div>
        <p className="font-bold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>

      <div
        className={`text-lg font-black ${style.text}`}
      >
        {result}
      </div>
    </div>
  );
}