type DashboardCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-[34px] font-black leading-none text-[#123b86]">
        {value}
      </p>
      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}