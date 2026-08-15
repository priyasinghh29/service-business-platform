type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  info: "bg-primary-fixed text-primary ring-1 ring-inset ring-primary-fixed-dim",
  neutral: "bg-surface-container-high text-on-surface-variant ring-1 ring-inset ring-outline-variant/60",
};

const statusToneMap: Record<string, StatusTone> = {
  "in progress": "info",
  progress: "info",
  review: "warning",
  "needs docs": "warning",
  pending: "warning",
  "pending review": "warning",
  completed: "success",
  paid: "success",
  active: "success",
  resolved: "success",
  overdue: "danger",
  outstanding: "danger",
  "requires attention": "danger",
  high: "danger",
  medium: "warning",
  low: "neutral",
  open: "info",
  "waiting on you": "warning",
  draft: "neutral",
  invited: "neutral",
  "awaiting approval": "warning",
  "under review": "warning",
};

function toneFromLabel(label: string): StatusTone {
  return statusToneMap[label.trim().toLowerCase()] ?? "neutral";
}

export default function StatusBadge({
  label,
  tone,
  className = "",
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  const resolvedTone = tone ?? toneFromLabel(label);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-label-sm font-medium ${toneClasses[resolvedTone]} ${className}`}
    >
      {label}
    </span>
  );
}
