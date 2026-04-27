type PremiumCardProps = {
  title: string;
  value: string;
};

export default function PremiumCard({ title, value }: PremiumCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-black text-[#123b86]">{value}</p>
    </div>
  );
}