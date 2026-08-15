"use client";

import { useRouter } from "next/navigation";

interface PageBackButtonProps {
  className?: string;
  iconClassName?: string;
}

export default function PageBackButton({
  className = "mr-4 text-sm font-medium text-on-surface",
}: PageBackButtonProps) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      Back
    </button>
  );
}
