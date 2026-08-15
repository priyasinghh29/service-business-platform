import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/home/Reveal";
import FaqSection from "@/components/home/FaqSection";
import {
  heroImage,
  industries,
  journeySteps,
  partnerLogos,
  pricingPlans,
  services,
  testimonials,
  trustStats,
  whyChooseUs,
  whyImage,
} from "@/lib/home-data";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-12 pt-24 sm:pb-16 sm:pt-28 md:pb-20 md:pt-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-10">
        <div className="relative z-10 w-full max-w-xl">
          <h1 className="animate-hero-in font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-black sm:text-[2.6rem] md:text-[3.4rem] lg:text-[4.1rem]">
            Professional Services, Delivered Digitally
          </h1>
          <p className="animate-hero-in-delay mt-5 max-w-md text-base leading-7 text-[#5b5f6a] sm:mt-6 sm:text-[17px]">
            Discover services, book consultations, and manage your entire client journey through our
            secure digital portal. Modernizing professional excellence.
          </p>
          <div className="animate-hero-in-delay-2 mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              href="/book-consultation"
              className="rounded-full bg-[#007aff] px-6 py-3.5 text-center text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(0,122,255,0.55)] transition-transform hover:scale-[1.02]"
            >
              Book Consultation
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-black bg-white px-6 py-3.5 text-center text-[15px] font-semibold text-black transition-colors hover:bg-black/5"
            >
              Explore Services
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] overflow-hidden lg:min-h-[520px] lg:overflow-visible">
          <div className="relative mx-auto aspect-[9/16] w-[min(220px,72vw)] overflow-hidden rounded-[28px] bg-black shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)] sm:w-[230px] lg:w-[250px]">
            <Image
              src={heroImage}
              alt="Professionals collaborating in a modern digital workspace"
              width={500}
              height={860}
              className="h-full w-full object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <p className="text-[11px] font-semibold leading-snug text-black">
                {services[0].title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#5b5f6a]">
                {services[0].description}
              </p>
              <Link
                href="/book-consultation"
                className="mt-2 block w-full rounded-full bg-black py-2 text-center text-[11px] font-semibold text-white"
              >
                Book Consultation
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
            <div className="hero-float rounded-2xl bg-white p-3">
              <p className="text-[12px] font-semibold text-black">{services[1].title}</p>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-[#5b5f6a]">
                {services[1].description}
              </p>
            </div>
            <div className="hero-float rounded-2xl bg-[#007aff] p-3 text-white">
              <p className="font-display text-2xl font-bold">{trustStats[3].value}</p>
              <p className="mt-1 text-[11px] font-semibold leading-snug">{trustStats[3].label}</p>
            </div>
          </div>

          <div className="pointer-events-none hidden lg:block">
            <div className="hero-float absolute left-0 top-[150px] z-20 w-[168px] overflow-hidden rounded-2xl bg-white p-3">
              <p className="text-[12px] font-semibold text-black">{services[1].title}</p>
              <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-[#5b5f6a]">
                {services[1].description}
              </p>
            </div>
            <div className="hero-float absolute bottom-16 left-0 z-20 w-[210px] rounded-2xl bg-white p-3">
              <p className="mb-2 text-[12px] font-semibold text-black">{whyChooseUs[1].title}</p>
              <div className="flex flex-wrap gap-1.5">
                {services.slice(0, 3).map((service) => (
                  <span
                    key={service.title}
                    className="rounded-full bg-[#e3f2fd] px-2.5 py-1 text-[10px] font-medium text-[#003ec7]"
                  >
                    {service.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute right-0 top-[90px] z-20 flex max-w-[46%] flex-col gap-2">
              {whyChooseUs.slice(0, 2).map((item) => (
                <div
                  key={item.title}
                  className="hero-float rounded-full bg-white px-3 py-2 text-[12px] font-medium text-black"
                >
                  {item.title}
                </div>
              ))}
            </div>
            <div className="hero-float absolute bottom-8 right-0 z-20 w-[150px] rounded-2xl bg-[#007aff] p-4 text-white">
              <p className="font-display text-2xl font-bold">{trustStats[3].value}</p>
              <p className="mt-1 text-[11px] font-semibold leading-snug">{trustStats[3].label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="bg-white pb-12 sm:pb-16 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex justify-center overflow-hidden opacity-45 grayscale sm:mb-14">
          <Image
            src={partnerLogos}
            alt="Trusted partner logos"
            width={480}
            height={40}
            className="h-6 w-auto max-w-full object-contain sm:h-8"
            unoptimized
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {trustStats.map((stat) => (
            <Reveal key={stat.label}>
              <div className="rounded-[22px] bg-[#f0f7ff] px-6 py-8 sm:px-8 sm:py-10">
                <div className="font-display text-4xl font-bold tracking-tight text-[#001f3f] sm:text-5xl md:text-6xl">
                  {stat.value}
                </div>
                <p className="mt-3 text-[12px] font-semibold uppercase leading-5 tracking-[0.08em] text-[#4b5568] sm:mt-4">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 bg-surface py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-xxl text-center">
            <h2 className="mb-sm font-display text-2xl text-on-background sm:text-headline-lg">
              Comprehensive Business Services
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
              Specialized expertise tailored for modern enterprises, delivered through our integrated
              digital platform.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Reveal key={service.title}>
              <div className="service-card group rounded-[20px] border border-outline-variant/40 bg-white p-6 transition-all duration-300 hover:border-[#007aff] hover:shadow-xl sm:p-xl">
                <h3 className="mb-sm font-display text-headline-sm text-on-background">
                  {service.title}
                </h3>
                <p className="mb-lg text-body-sm text-on-surface-variant">{service.description}</p>
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-xs font-semibold text-label-md text-primary transition-all hover:gap-sm"
                >
                  Learn More 
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden bg-surface-container-low py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 md:gap-xxl lg:grid-cols-2 lg:px-10">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-1 gap-lg">
            {whyChooseUs.map((item) => (
              <Reveal key={item.title}>
                <div className="flex gap-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                  <div>
                    <h4 className="mb-xs font-display text-headline-sm text-on-background">
                      {item.title}
                    </h4>
                    <p className="text-body-sm text-on-surface-variant">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <Reveal>
            <h2 className="mb-lg font-display text-2xl text-on-background sm:text-headline-lg">
              Built for the Modern Professional
            </h2>
            <p className="mb-xl text-body-lg text-on-surface-variant">
              We combine institutional-grade expertise with the agility of a digital platform to
              provide a service experience that is seamless, secure, and highly efficient.
            </p>
            <Image
              src={whyImage}
              alt="Professional dashboard on a laptop in a modern office"
              width={960}
              height={540}
              className="aspect-video w-full rounded-xl border border-outline-variant/30 object-cover shadow-lg"
              unoptimized
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="bg-surface-container-lowest py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-xxl text-center">
            <h2 className="mb-sm font-display text-2xl text-on-background sm:text-headline-lg">
              Your Journey to Success
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
              A streamlined 6-step process designed to get you from inquiry to results as fast as
              possible.
            </p>
          </div>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-gutter sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {journeySteps.map((item) => (
            <Reveal key={item.step}>
              <div className="relative text-center">
                <div className="relative z-10 mx-auto mb-md flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                  {item.step}
                </div>
                <h4 className="mb-xs text-label-md font-medium text-on-background">{item.title}</h4>
                <p className="text-body-sm text-on-surface-variant">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustriesSection() {
  return (
    <section id="industries" className="scroll-mt-24 bg-surface py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-xxl text-center">
            <h2 className="mb-sm font-display text-2xl text-on-background sm:text-headline-lg">
              Tailored for Your Industry
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Domain expertise across diverse sectors ensuring contextual service delivery.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-base md:grid-cols-3 md:gap-md lg:grid-cols-4">
          {industries.map((industry) => (
            <Reveal key={industry.label}>
              <div className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center transition-all hover:border-primary sm:p-lg">
                <p className="text-label-md font-medium text-on-background group-hover:text-primary">
                  {industry.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-24 bg-surface-container-low py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-xxl text-center">
            <h2 className="mb-sm font-display text-2xl text-on-background sm:text-headline-lg">
              Trusted by growing teams
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
              Clients use Oknitech Serve to book services, share documents, and track delivery in one
              place.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Reveal key={item.name}>
              <blockquote className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-xl">
                <p className="mb-lg flex-1 text-body-md text-on-surface-variant">&ldquo;{item.quote}&rdquo;</p>
                <footer>
                  <p className="font-display text-headline-sm text-on-background">{item.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{item.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-surface py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-xxl text-center">
            <h2 className="mb-sm font-display text-2xl text-on-background sm:text-headline-lg">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
              Choose a plan that matches your volume. Service fees are shown before you book.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Reveal key={plan.name}>
              <div
                className={`flex h-full flex-col rounded-xl border p-xl ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-outline-variant bg-surface-container-lowest"
                }`}
              >
                <p className="mb-xs text-label-sm font-bold uppercase tracking-wide text-primary">
                  {plan.name}
                </p>
                <div className="mb-sm flex items-baseline gap-1">
                  <span className="font-display text-headline-lg text-on-background">{plan.price}</span>
                  {plan.period ? (
                    <span className="text-label-md text-on-surface-variant">{plan.period}</span>
                  ) : null}
                </div>
                <p className="mb-lg text-body-sm text-on-surface-variant">{plan.description}</p>
                <ul className="mb-xl flex-1 space-y-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-sm text-body-sm text-on-surface">
                      
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`rounded-lg px-lg py-sm text-center text-label-md font-medium transition-opacity hover:opacity-90 ${
                    plan.highlighted
                      ? "bg-primary-container text-on-primary"
                      : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contact" className="scroll-mt-24 py-12 sm:py-16 md:py-xxl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] bg-[#001f3f] px-6 py-10 text-center text-white sm:rounded-[28px] sm:px-10 sm:py-14 md:p-xxl">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)] opacity-100"
              aria-hidden
            />
            <h2 className="relative z-10 mb-lg font-display text-[1.75rem] font-bold tracking-tight sm:text-[2rem] md:text-display">
              Ready to transform your client experience?
            </h2>
            <p className="relative z-10 mx-auto mb-xxl max-w-2xl text-body-lg opacity-90">
              Join over 500+ professionals who have streamlined their business operations with
              Oknitech Serve.
            </p>
            <div className="relative z-10 flex w-full flex-col justify-center gap-md sm:flex-row sm:flex-wrap">
              <Link
                href="/book-consultation"
                className="rounded-full bg-[#007aff] px-6 py-3 text-center font-medium text-label-md text-white shadow-xl transition-transform hover:scale-[1.05] sm:px-xxl sm:py-md"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-center font-medium text-label-md text-white transition-colors hover:bg-white/10 sm:px-xxl sm:py-md"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomeSections() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ServicesSection />
      <WhySection />
      <TestimonialsSection />
      <PricingSection />
      <JourneySection />
      <IndustriesSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
