type InfoBoxProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

export default function InfoBox({
  label,
  value,
  highlight = false,
}: InfoBoxProps) {
  return (
    <div className="flex min-h-[92px] flex-col items-center justify-center rounded-[16px] border border-[#d7e5ff] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(244,249,255,0.98)_100%)] px-3 py-4 text-center shadow-sm md:min-h-[96px] md:px-4">
      <p className="mb-1.5 text-xs font-medium text-slate-500 md:text-sm">
        {label}
      </p>
      <p
        className={`text-[24px] font-extrabold leading-none md:text-[26px] ${
          highlight ? "text-[#1d4ed8]" : "text-[#1f3762]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}