type FeatureLineProps = {
  text: string;
};

export default function FeatureLine({ text }: FeatureLineProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{text}</span>
      <span className="font-bold text-green-600">✓</span>
    </div>
  );
}