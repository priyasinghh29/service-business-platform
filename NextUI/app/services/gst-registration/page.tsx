import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import {
  gstBenefits,
  gstIncludes,
  gstDocChecklist,
  gstPackages,
  gstProcessSteps,
  industrySectors,
  gstFaqs,
  gstRelatedServices,
} from "@/lib/marketing-pages";

export const metadata = {
  title: "GST Registration Services | Oknitech Serve",
  description:
    "Fast, compliant GST registration services starting at $299 with a 3-5 day turnaround. Get your GSTIN with expert support from Oknitech Serve.",
};

function Breadcrumb() {
  return (
    <div className="border-b border-outline-variant/30 bg-surface-container-lowest">
      <div className="mx-auto max-w-7xl px-margin-mobile py-md md:px-margin-desktop">
        <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="transition-colors hover:text-primary">
            Services
          </Link>
          <span>/</span>
          <span className="font-medium text-on-surface">GST Registration</span>
        </nav>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-xxl lg:grid-cols-2">
          <div>
            <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
              Tax Compliance
            </span>
            <h1 className="mb-lg font-display text-[2rem] font-bold leading-tight tracking-tight text-on-surface md:text-headline-lg">
              GST Registration Services
            </h1>
            <p className="mb-xl max-w-lg text-body-lg text-on-surface-variant">
              Get your business GST-registered quickly and correctly. Our compliance specialists
              handle documentation, filing, and follow-up so you can focus on running your
              business.
            </p>
            <div className="flex flex-wrap gap-md">
              <Link
                href="/book/gst-registration"
                className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
              >
                Book Now
              </Link>
              <Link
                href="#packages"
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Request Quote
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm">
            <div className="grid grid-cols-3 gap-lg text-center">
              <div>
                
                <div className="font-display text-headline-md text-on-surface">$299</div>
                <div className="text-label-sm text-on-surface-variant">Starting Price</div>
              </div>
              <div>
                
                <div className="font-display text-headline-md text-on-surface">3-5 Days</div>
                <div className="text-label-sm text-on-surface-variant">Turnaround</div>
              </div>
              <div>
                
                <div className="font-display text-headline-md text-on-surface">100%</div>
                <div className="text-label-sm text-on-surface-variant">Compliance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Why Register for GST With Us
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {gstBenefits.map((item) => (
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

function IncludesAndChecklistSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
          <h3 className="mb-lg font-display text-headline-sm text-on-surface">What's Included</h3>
          <ul className="space-y-md">
            {gstIncludes.map((item) => (
              <li key={item} className="flex items-start gap-sm text-body-md text-on-surface">
                
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
          <h3 className="mb-lg font-display text-headline-sm text-on-surface">
            Document Checklist
          </h3>
          <ul className="space-y-md">
            {gstDocChecklist.map((item) => (
              <li key={item} className="flex items-start gap-sm text-body-md text-on-surface">
                
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PackagesSection() {
  return (
    <section id="packages" className="scroll-mt-24 py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Choose Your Package
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Transparent pricing with no hidden fees. Upgrade anytime as your needs grow.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {gstPackages.map((pkg) => (
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
              <div className="mb-sm font-display text-headline-lg text-primary">{pkg.price}</div>
              <p className="mb-lg text-body-sm text-on-surface-variant">{pkg.description}</p>
              <ul className="mb-xl space-y-sm">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-xs text-body-sm text-on-surface">
                    
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/book-consultation"
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

function ProcessSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Our Registration Process
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-6">
          {gstProcessSteps.map((item) => (
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
          <h2 className="font-display text-headline-lg text-on-surface">
            Industries We Register
          </h2>
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

function FaqSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
        <h2 className="mb-xxl text-center font-display text-headline-lg text-on-surface">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={gstFaqs} />
      </div>
    </section>
  );
}

function RelatedServicesSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="font-display text-headline-lg text-on-surface">Related Services</h2>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {gstRelatedServices.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <h3 className="mb-sm font-display text-headline-sm text-on-surface">{service.title}</h3>
              <p className="mb-lg text-body-sm text-on-surface-variant">{service.description}</p>
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

function CtaBand() {
  return (
    <section className="pb-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-2xl bg-primary-container p-xxl text-center text-on-primary">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
            aria-hidden
          />
          <h2 className="relative z-10 mb-lg font-display text-headline-lg font-bold md:text-display">
            Ready to get GST registered?
          </h2>
          <p className="relative z-10 mx-auto mb-xl max-w-2xl text-body-lg opacity-90">
            Book a free consultation today and have your GSTIN in as little as 3 days.
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
              View All Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GstRegistrationPage() {
  return (
    <MarketingLayout>
      <Breadcrumb />
      <HeroSection />
      <BenefitsSection />
      <IncludesAndChecklistSection />
      <PackagesSection />
      <ProcessSection />
      <IndustriesSection />
      <FaqSection />
      <RelatedServicesSection />
      <CtaBand />
    </MarketingLayout>
  );
}
