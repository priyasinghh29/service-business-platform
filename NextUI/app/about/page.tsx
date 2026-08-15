import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import {
  aboutPrinciples,
  leadershipTeam,
  companyTimeline,
  accreditations,
  csrInitiatives,
  aboutFaqs,
  industrySectors,
} from "@/lib/marketing-pages";

export const metadata = {
  title: "About Us | Oknitech Serve",
  description:
    "Learn about Oknitech Serve's mission, values, leadership team, and 15+ years of trusted professional services.",
};

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
      <div className="mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
          Established Trust Since 2009
        </span>
        <h1 className="mb-lg font-display text-[2rem] font-bold leading-tight tracking-tight text-on-surface md:text-display">
          Helping Businesses Grow with Trusted Professional Services
        </h1>
        <p className="mx-auto mb-xl max-w-2xl text-body-lg text-on-surface-variant">
          For over 15 years, we've combined institutional-grade expertise with a modern digital
          experience to help businesses of every size navigate accounting, tax, legal, and
          compliance with confidence.
        </p>
        <div className="flex flex-wrap justify-center gap-md">
          <Link
            href="/book-consultation"
            className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
          >
            Book Consultation
          </Link>
          <Link
            href="/services"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Our Services
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhoWhatValuesSection() {
  const cards = [
    {
      icon: "groups",
      title: "Who We Are",
      description:
        "A team of certified accountants, tax advisors, and legal professionals united by a shared commitment to client success.",
    },
    {
      icon: "task",
      title: "What We Do",
      description:
        "End-to-end professional services spanning accounting, tax, legal, registration, and compliance, delivered through a secure digital platform.",
    },
    {
      icon: "security",
      title: "Our Values",
      description:
        "Integrity, transparency, and accountability guide every engagement, ensuring you always know exactly where you stand.",
    },
  ];

  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm"
            >
              <h3 className="mb-sm font-display text-headline-sm text-on-surface">{card.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionVisionSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
          <h3 className="mb-md font-display text-headline-md text-on-surface">Our Mission</h3>
          <p className="text-body-md text-on-surface-variant">
            To empower businesses with accessible, transparent, and technology-driven professional
            services that remove the friction from compliance and financial management, so our
            clients can focus on what they do best.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
          <h3 className="mb-md font-display text-headline-md text-on-surface">Our Vision</h3>
          <p className="text-body-md text-on-surface-variant">
            To be the most trusted digital partner for business services worldwide, known for our
            unwavering integrity, deep expertise, and relentless focus on client outcomes.
          </p>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            The Principles That Guide Us
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Eight core principles shape every decision we make and every service we deliver.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {aboutPrinciples.map((principle) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg text-center transition-colors hover:border-primary"
            >
              <h4 className="mb-xs text-label-md font-bold text-on-surface">{principle.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadershipSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Meet Our Leadership
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Seasoned professionals dedicated to guiding your business forward.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {leadershipTeam.map((leader) => (
            <div
              key={leader.name}
              className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl text-center"
            >
              <div className="mx-auto mb-lg flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 font-display text-headline-md text-primary">
                {leader.initials}
              </div>
              <h4 className="mb-xs font-display text-headline-sm text-on-surface">{leader.name}</h4>
              <p className="mb-md text-label-md font-medium text-primary">{leader.role}</p>
              <p className="text-body-sm text-on-surface-variant">{leader.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-5xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">Our Journey</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Fifteen years of growth, milestones, and unwavering client commitment.
          </p>
        </div>
        <div className="relative space-y-xl border-l-2 border-outline-variant/50 pl-xl">
          {companyTimeline.map((item) => (
            <div key={item.year} className="relative">
              <div className="absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full bg-primary" />
              <span className="mb-xs inline-block font-display text-headline-sm text-primary">
                {item.year}
              </span>
              <h4 className="mb-xs text-label-md font-bold text-on-surface">{item.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccreditationsSection() {
  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-lowest py-xl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <p className="mb-lg text-center text-label-sm font-bold uppercase tracking-wide text-on-surface-variant">
          Accreditations &amp; Certifications
        </p>
        <div className="flex flex-wrap items-center justify-center gap-xl">
          {accreditations.map((item) => (
            <div key={item.label} className="flex items-center gap-xs text-on-surface-variant">
              
              <span className="text-label-md font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustriesStrip() {
  return (
    <section className="py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xl text-center">
          <h2 className="font-display text-headline-lg text-on-surface">Industries We Serve</h2>
        </div>
        <div className="grid grid-cols-2 gap-base md:grid-cols-4">
          {industrySectors.slice(0, 8).map((industry) => (
            <div
              key={industry.title}
              className="flex items-center gap-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg"
            >
              <span className="text-label-md font-medium text-on-surface">{industry.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CsrSection() {
  return (
    <section className="bg-surface-container-low py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">
            Corporate Social Responsibility
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            We believe in giving back to the communities that have supported our growth.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {csrInitiatives.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl"
            >
              <h4 className="mb-sm font-display text-headline-sm text-on-surface">{item.title}</h4>
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
        <FaqAccordion items={aboutFaqs} />
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
            Ready to work with a team you can trust?
          </h2>
          <p className="relative z-10 mx-auto mb-xl max-w-2xl text-body-lg opacity-90">
            Book a complimentary consultation and discover how Oknitech Serve can support your
            business goals.
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

export default function AboutPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <WhoWhatValuesSection />
      <MissionVisionSection />
      <PrinciplesSection />
      <LeadershipSection />
      <TimelineSection />
      <AccreditationsSection />
      <IndustriesStrip />
      <CsrSection />
      <FaqSection />
      <CtaBand />
    </MarketingLayout>
  );
}
