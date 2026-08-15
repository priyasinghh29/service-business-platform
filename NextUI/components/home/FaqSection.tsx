"use client";

import { useState } from "react";
import { faqs } from "@/lib/home-data";
import Reveal from "@/components/home/Reveal";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-surface-container-lowest py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-margin-desktop">
        <Reveal>
          <h2 className="mb-xxl text-center font-display text-2xl text-on-background sm:text-headline-lg">
            Frequently Asked Questions
          </h2>
        </Reveal>

        <div className="space-y-base">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.question}>
                <div className="border-b border-outline-variant py-md">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="group flex w-full items-start justify-between gap-3 text-left font-display text-base text-on-background transition-colors hover:text-primary sm:items-center sm:gap-4 sm:text-headline-sm"
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
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
