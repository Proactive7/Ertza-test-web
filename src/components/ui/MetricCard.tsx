type MetricCardProps = {
  number: string;
  label: string;
};

export default function MetricCard({ number, label }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="text-2xl font-extrabold text-white">{number}</p>
      <p className="mt-1 text-sm text-blue-100">{label}</p>
    </div>
  );
}