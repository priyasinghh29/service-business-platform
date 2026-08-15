import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import {
  industrySectors,
  industryPainPoints,
  industryBundles,
  industryStats,
  whyChooseUsServices,
  industriesFaqs,
} from "@/lib/marketing-pages";

export const metadata = {
  title: "Industries | Oknitech Serve",
  description:
    "Discover industry-specific professional services from Oknitech Serve, tailored for startups, IT, healthcare, manufacturing, retail, real estate, education, and logistics.",
};

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
      <div className="mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
          Industries
        </span>
        <h1 className="mb-lg font-display text-[2rem] font-bold leading-tight tracking-tight text-on-surface md:text-display">
          Professional Solutions Tailored for Every Industry.
        </h1>
        <p className="mx-auto mb-xl max-w-2xl text-body-lg text-on-surface-variant">
          Every sector has its own regulatory and financial complexities. Our specialists bring
          deep domain expertise to solve the challenges unique to your industry.
        </p>
        <div className="flex flex-wrap justify-center gap-md">
          <Link
            href="/book-consultation"
            className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
          >
            Book Consultation
          </Link>
          <Link
            href="#bundles"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            View Bundles
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectorsSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Sectors We Serve
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Specialized teams with hands-on experience across eight core industries.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {industrySectors.map((sector) => (
            <div
              key={sector.title}
              className="group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <h3 className="mb-sm font-display text-headline-sm text-on-surface">{sector.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{sector.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainPointTable() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-6xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Common Pain Points, Solved
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            We've seen these challenges before, and we know exactly how to fix them.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="grid grid-cols-3 gap-4 bg-surface-container-low px-lg py-md text-label-md font-bold text-on-surface">
            <span>Industry</span>
            <span>Common Pain Point</span>
            <span>Our Solution</span>
          </div>
          {industryPainPoints.map((row, index) => (
            <div
              key={row.industry}
              className={`grid grid-cols-3 gap-4 px-lg py-md text-body-sm text-on-surface-variant ${
                index !== industryPainPoints.length - 1 ? "border-b border-outline-variant/30" : ""
              }`}
            >
              <span className="font-medium text-on-surface">{row.industry}</span>
              <span>{row.painPoint}</span>
              <span className="flex items-start gap-xs text-on-surface">
                
                {row.ourSolution}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BundlesSection() {
  return (
    <section id="bundles" className="scroll-mt-24 py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Priority Industry Bundles
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Curated packages built around the most common needs of growing businesses.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {industryBundles.map((bundle, index) => (
            <div
              key={bundle.name}
              className={`flex flex-col rounded-2xl border p-xl shadow-sm ${
                index === 1
                  ? "border-primary bg-surface-container-lowest ring-2 ring-primary"
                  : "border-outline-variant/50 bg-surface-container-lowest"
              }`}
            >
              {index === 1 && (
                <span className="mb-md inline-block w-fit rounded-lg bg-primary-container px-sm py-xs text-label-sm font-bold text-on-primary">
                  Recommended
                </span>
              )}
              <h3 className="mb-xs font-display text-headline-sm text-on-surface">{bundle.name}</h3>
              <div className="mb-sm font-display text-headline-lg text-primary">{bundle.price}</div>
              <p className="mb-lg text-body-sm text-on-surface-variant">{bundle.description}</p>
              <ul className="mb-xl space-y-sm">
                {bundle.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-xs text-body-sm text-on-surface">
                    
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/book-consultation"
                className={`mt-auto rounded-lg px-lg py-sm text-center font-medium text-label-md transition-all ${
                  index === 1
                    ? "bg-primary-container text-on-primary hover:opacity-90"
                    : "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseStatsSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl grid grid-cols-2 gap-gutter text-center md:grid-cols-4">
          {industryStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg">
              <div className="font-display text-headline-lg text-primary">{stat.value}</div>
              <div className="text-label-md text-on-surface-variant">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">Why Choose Us</h2>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUsServices.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg"
            >
              <h4 className="mb-xs text-label-md font-bold text-on-surface">{item.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
        <h2 className="mb-xxl text-center font-display text-headline-lg text-on-surface">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={industriesFaqs} />
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-2xl bg-primary-container p-xxl text-center text-on-primary">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
            aria-hidden
          />
          <h2 className="relative z-10 mb-lg font-display text-headline-lg font-bold md:text-display">
            Don't see your industry listed?
          </h2>
          <p className="relative z-10 mx-auto mb-xl max-w-2xl text-body-lg opacity-90">
            We work with businesses across dozens of sectors. Book a consultation and let's talk
            about your specific needs.
          </p>
          <div className="relative z-10 flex flex-wrap justify-center gap-md">
            <Link
              href="/book-consultation"
              className="rounded-lg bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-primary shadow-xl transition-transform hover:scale-[1.03]"
            >
              Book Consultation
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-white/30 px-lg py-sm font-medium text-label-md text-on-primary transition-colors hover:bg-white/10"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IndustriesPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <SectorsSection />
      <PainPointTable />
      <BundlesSection />
      <WhyChooseStatsSection />
      <FaqSection />
      <CtaBand />
    </MarketingLayout>
  );
}
