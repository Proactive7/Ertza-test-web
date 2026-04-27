type TimelineItemProps = {
  title: string;
  score: string;
  status: string;
};

export default function TimelineItem({ title, score, status }: TimelineItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fbff] px-3 py-3">
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{status}</p>
      </div>
      <div className="font-black text-[#2156b4]">{score}</div>
    </div>
  );
}