import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import LiveCatalogSection from "@/components/marketing/LiveCatalogSection";
import {
  expertiseCards,
  featuredPackages,
  whyChooseUsServices,
  serviceProcessSteps,
  industrySectors,
  successStories,
  servicesFaqs,
} from "@/lib/marketing-pages";

export const metadata = {
  title: "Services | Oknitech Serve",
  description:
    "Explore Oknitech Serve's full range of accounting, tax, legal, and compliance services designed around your business.",
};

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
      <div className="mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
          Our Services
        </span>
        <h1 className="mb-lg font-display text-[2rem] font-bold leading-tight tracking-tight text-on-surface md:text-display">
          Professional Services Designed Around Your Business
        </h1>
        <p className="mx-auto mb-xl max-w-2xl text-body-lg text-on-surface-variant">
          From accounting and tax to legal advisory and compliance, our specialists deliver
          transparent, technology-enabled services tailored to your stage of growth.
        </p>
        <div className="flex flex-wrap justify-center gap-md">
          <Link
            href="/book-consultation"
            className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
          >
            Book Consultation
          </Link>
          <Link
            href="#packages"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            View Packages
          </Link>
        </div>
      </div>
    </section>
  );
}

function ExpertiseSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Areas of Expertise
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Eight core service lines covering the full lifecycle of your business needs.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {expertiseCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <h3 className="mb-sm font-display text-headline-sm text-on-surface">{card.title}</h3>
              <p className="mb-lg text-body-sm text-on-surface-variant">{card.description}</p>
              <span className="inline-flex items-center gap-xs font-semibold text-label-md text-primary transition-all group-hover:gap-sm">
                Learn More 
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PackagesSection() {
  return (
    <section id="packages" className="scroll-mt-24 bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Featured Packages
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Transparent, flat-fee pricing so you know exactly what to expect.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {featuredPackages.map((pkg) => (
            <div
              key={pkg.name}
              className={`flex flex-col rounded-2xl border p-xl shadow-sm ${
                pkg.highlighted
                  ? "border-primary bg-surface-container-lowest ring-2 ring-primary"
                  : "border-outline-variant/50 bg-surface-container-lowest"
              }`}
            >
              {pkg.highlighted && (
                <span className="mb-md inline-block w-fit rounded-lg bg-primary-container px-sm py-xs text-label-sm font-bold text-on-primary">
                  Most Popular
                </span>
              )}
              <h3 className="mb-xs font-display text-headline-sm text-on-surface">{pkg.name}</h3>
              <div className="mb-sm flex items-baseline gap-xs">
                <span className="font-display text-headline-lg text-primary">{pkg.price}</span>
                <span className="text-body-sm text-on-surface-variant">/ {pkg.period}</span>
              </div>
              <p className="mb-lg text-body-sm text-on-surface-variant">{pkg.description}</p>
              <ul className="mb-xl space-y-sm">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-xs text-body-sm text-on-surface">
                    
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.href}
                className={`mt-auto rounded-lg px-lg py-sm text-center font-medium text-label-md transition-all ${
                  pkg.highlighted
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

function WhyChooseUsSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">Why Choose Us</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            The advantages that set our service delivery apart.
          </p>
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

function ProcessSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">How It Works</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            A streamlined 6-step process from consultation to delivery.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-6">
          {serviceProcessSteps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-md flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                {item.step}
              </div>
              <h4 className="mb-xs text-label-md font-medium text-on-surface">{item.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustriesSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="font-display text-headline-lg text-on-surface">Serving Every Industry</h2>
        </div>
        <div className="grid grid-cols-2 gap-base md:grid-cols-4">
          {industrySectors.map((industry) => (
            <div
              key={industry.title}
              className="group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg text-center transition-all hover:border-primary"
            >
              <p className="text-label-md font-medium text-on-surface group-hover:text-primary">
                {industry.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SuccessStoriesSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">Success Stories</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Real outcomes from businesses we've partnered with.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {successStories.map((story) => (
            <div
              key={story.name}
              className="flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl"
            >
              <span className="mb-md inline-block w-fit rounded-lg bg-primary/10 px-sm py-xs text-label-sm font-bold text-primary">
                {story.result}
              </span>
              <p className="mb-lg flex-1 text-body-md italic text-on-surface-variant">
                "{story.quote}"
              </p>
              <div>
                <p className="text-label-md font-bold text-on-surface">{story.name}</p>
                <p className="text-body-sm text-on-surface-variant">{story.company}</p>
              </div>
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
        <FaqAccordion items={servicesFaqs} />
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
            Not sure which service you need?
          </h2>
          <p className="relative z-10 mx-auto mb-xl max-w-2xl text-body-lg opacity-90">
            Book a free consultation and our specialists will recommend the right path for your
            business.
          </p>
          <div className="relative z-10 flex flex-wrap justify-center gap-md">
            <Link
              href="/book-consultation"
              className="rounded-lg bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-primary shadow-xl transition-transform hover:scale-[1.03]"
            >
              Book Consultation
            </Link>
            <Link
              href="/industries"
              className="rounded-lg border border-white/30 px-lg py-sm font-medium text-label-md text-on-primary transition-colors hover:bg-white/10"
            >
              Explore Industries
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <ExpertiseSection />
      <LiveCatalogSection />
      <PackagesSection />
      <WhyChooseUsSection />
      <ProcessSection />
      <IndustriesSection />
      <SuccessStoriesSection />
      <FaqSection />
      <CtaBand />
    </MarketingLayout>
  );
}
