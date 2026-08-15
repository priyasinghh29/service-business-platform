import Link from "next/link";

function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[#007aff] text-white ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="currentColor">
        <path d="M12 2.2 13.6 8.4 20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2.2Z" />
      </svg>
    </span>
  );
}

export default function Logo({
  size = "nav",
}: {
  size?: "nav" | "hero" | "footer";
}) {
  if (size === "hero") {
    return (
      <p className="font-display text-4xl font-bold tracking-tight text-[#0b1c30] md:text-5xl">
        Oknitech Serve
      </p>
    );
  }

  if (size === "footer") {
    return (
      <Link href="/" className="inline-flex items-center gap-2">
        <Mark className="h-8 w-8" />
        <span className="font-display text-headline-sm font-bold text-[#0b1c30]">Oknitech Serve</span>
      </Link>
    );
  }

  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-2 sm:gap-2.5">
      <Mark className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
      <span className="truncate font-display text-base font-bold text-[#0b1c30] sm:text-headline-md">
        Oknitech Serve
      </span>
    </Link>
  );
}
