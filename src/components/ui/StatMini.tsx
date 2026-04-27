type StatMiniProps = {
  title: string;
  value: string;
};

export default function StatMini({ title, value }: StatMiniProps) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-[#123b86]">{value}</p>
    </div>
  );
}