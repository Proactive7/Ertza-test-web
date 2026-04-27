type PremiumFeatureProps = {
  text: string;
};

export default function PremiumFeature({ text }: PremiumFeatureProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 font-black text-green-600">
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}