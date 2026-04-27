type BenefitProps = {
  text: string;
};

export default function Benefit({ text }: BenefitProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 font-black text-green-600">
        ✓
      </span>
      <span className="font-medium text-slate-700">{text}</span>
    </div>
  );
}