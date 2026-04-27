type PanelTimelineItemProps = {
  title: string;
  detail: string;
  result: string;
};

export default function PanelTimelineItem({
  title,
  detail,
  result,
}: PanelTimelineItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbff] px-4 py-4">
      <div>
        <p className="font-bold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
      <div className="text-lg font-black text-[#2156b4]">{result}</div>
    </div>
  );
}