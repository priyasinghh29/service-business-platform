export default function KpiCard({
  label,
  value,
  hint,
  hintTone = "neutral",
}: {
  icon?: string;
  label: string;
  value: string;
  hint?: string;
  hintTone?: "positive" | "warning" | "negative" | "neutral";
}) {
  const hintColor =
    hintTone === "positive"
      ? "text-emerald-600"
      : hintTone === "warning"
        ? "text-amber-600"
        : hintTone === "negative"
          ? "text-rose-600"
          : "text-on-surface-variant";

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="mt-3 text-headline-md font-display font-semibold text-on-surface">{value}</p>
      {hint && <p className={`mt-1 text-label-sm ${hintColor}`}>{hint}</p>}
    </div>
  );
}
