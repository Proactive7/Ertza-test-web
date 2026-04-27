type ResultRowProps = {
  label: string;
  value: string;
};

export default function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between rounded-[18px] bg-[#f8fafc] px-5 py-4">
      <span className="text-lg text-slate-600">{label}</span>
      <span className="text-2xl font-extrabold text-[#1f3762]">{value}</span>
    </div>
  );
}