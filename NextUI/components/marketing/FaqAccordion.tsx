"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({
  items,
  defaultOpenIndex = 0,
}: {
  items: FaqItem[];
  defaultOpenIndex?: number;
}) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  return (
    <div className="space-y-base">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-lg py-md"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 text-left font-display text-headline-sm text-on-surface transition-colors hover:text-primary"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <span className="shrink-0 text-lg font-light text-on-surface-variant">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="mt-md text-body-md text-on-surface-variant">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
