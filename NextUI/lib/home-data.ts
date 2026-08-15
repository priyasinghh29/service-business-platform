export const trustStats = [
  { value: "15+", label: "Years Experience" },
  { value: "1,200+", label: "Projects Delivered" },
  { value: "500+", label: "Clients Served" },
  { value: "99%", label: "Satisfaction Rate" },
];

export const services = [
  {
    icon: "account_balance",
    title: "Accounting",
    description:
      "Full-cycle bookkeeping and financial reporting with real-time digital access to your ledger.",
  },
  {
    icon: "task",
    title: "Tax Compliance",
    description:
      "Strategic tax planning and preparation to ensure full compliance while optimizing your tax position.",
  },
  {
    icon: "gavel",
    title: "Legal Advisory",
    description:
      "Expert corporate legal guidance, contract management, and regulatory compliance consulting.",
  },
  {
    icon: "app_registration",
    title: "Business Registration",
    description:
      "Seamless entity formation and licensing support to get your business operational faster.",
  },
  {
    icon: "payments",
    title: "Payroll",
    description:
      "Automated payroll processing with integrated tax filings and employee benefit management.",
  },
  {
    icon: "groups",
    title: "HR Consulting",
    description:
      "Strategic talent management, policy development, and workforce planning solutions.",
  },
];

export const whyChooseUs = [
  {
    icon: "support_agent",
    title: "Dedicated Relationship Manager",
    description:
      "Your single point of contact for all service needs, ensuring personalized attention.",
  },
  {
    icon: "sell",
    title: "Transparent Pricing",
    description: "Flat-fee models with no hidden surprises. Pay only for the value you receive.",
  },
  {
    icon: "security",
    title: "Secure Document Sharing",
    description:
      "Enterprise-grade encryption for all files, accessible 24/7 through your portal.",
  },
];

export const journeySteps = [
  { step: 1, title: "Explore", description: "Browse our range of services." },
  { step: 2, title: "Book", description: "Schedule your initial consultation." },
  { step: 3, title: "Submit", description: "Provide project details online." },
  { step: 4, title: "Upload", description: "Securely share required documents." },
  { step: 5, title: "Track", description: "Monitor progress in real-time." },
  { step: 6, title: "Receive", description: "Get deliverables via your portal." },
];

export const industries = [
  { icon: "medical_services", label: "Healthcare" },
  { icon: "factory", label: "Manufacturing" },
  { icon: "shopping_cart", label: "Retail" },
  { icon: "computer", label: "Technology" },
  { icon: "account_balance_wallet", label: "Financial Services" },
  { icon: "apartment", label: "Real Estate" },
  { icon: "local_shipping", label: "Logistics" },
  { icon: "school", label: "Education" },
];

export const faqs = [
  {
    question: "How secure is my data on your platform?",
    answer:
      "We use AES-256 bank-level encryption for all data storage and transit. Your documents are housed in secure, redundantly-backed cloud environments that meet global compliance standards.",
  },
  {
    question: "Can I switch services later?",
    answer:
      "Yes, our platform is fully modular. You can add or remove services as your business needs evolve, with all your history remaining unified in one dashboard.",
  },
  {
    question: "Is there a long-term contract requirement?",
    answer:
      "We offer both project-based and retainer-based options. Our goal is flexibility, providing services that fit your specific operational requirements without unnecessary lock-ins.",
  },
];

export const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKvM9BGNNEgn59B8P8oxPncPyzPPKYZgO3GcvhEN6cMy4Kcuf4S8IMNmk2dvEf6ifH-6mMElCvh_3RG-odwpOfkQtEX7R0MdGKCFgd8QUWs-9Jpbv04fs7AHmk9XodKnXrfdacekN9oOsqMIaucSqml0JgVkqBdHH4O1B1XzjFCUQbs6TJyz_BXJBtJv7HdQ2YSuhN_2alseMoiNkUGCudPisSSAG5ymK_nrtIhDjne47yaEaBDrr67A";

export const whyImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCJi9EfLOa4nvVcThMNRCc8nTZsUu7wS3xZmbaiknEPTbuxdHWbx6Q_ZaFer2IO_XksCeP7eOdsTCZSC48N_T9zBx1GAYaq83X8XPtdw8XMGx7nxGr-8WtA1WojWnidROff48wAcBUzH0UYWCVtvrMMjVpyCOfpken9eWtX0hHBCrm9xYl66iA3bEyo9Nxt3YQHMCHshQWrdyf7_OGjeSt0tqtPBAj3H3oDfGTlQ0Oaqn_nWg8q2WgLyg";

export const partnerLogos =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD7psH05ldS1PSUkdel0NGqJoG8ndEf81BcrE5MbJYTGpkU6fcKMqRTTGDa49AV8tu-l3OuJPhV0kvAYBz8DZLuvUpD2nihe2ugHVv6uSzOaA1peNseisXuDrE89cdl5mucZwTlqkYPmS-wd_kyfFHRdqyB9RbL6WGxvPJJV1UlfNdlT7JrcJENjIKw5-JxRJ4H5j-9m0ABxdmTh5khtKGu4x9eJhCaNAws7cKm659nEuFYOZrmoUytDw";

// Kept for any leftover imports
export const howItWorks = journeySteps.map((s) => ({
  step: String(s.step).padStart(2, "0"),
  title: s.title,
  description: s.description,
}));

export const whoItsFor = industries.map((i) => i.label);

export const testimonials = [
  {
    quote:
      "Oknitech Serve turned our scattered compliance work into one clear portal. Booking, documents, and invoices finally live in the same place.",
    name: "Ananya Mehta",
    role: "Founder, Meridian Retail",
  },
  {
    quote:
      "Our relationship manager responds inside the platform, and we always know where each engagement stands. The transparency alone paid for itself.",
    name: "Rahul Desai",
    role: "COO, Northbridge Manufacturing",
  },
  {
    quote:
      "From GST filings to legal reviews, the digital booking and document vault cut our turnaround time dramatically.",
    name: "Priya Kapoor",
    role: "Finance Lead, Helix Health",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/mo",
    description: "For solo founders and early-stage teams",
    features: ["1 active engagement", "Document vault", "Email support", "Basic booking"],
    cta: "Get started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹7,999",
    period: "/mo",
    description: "For growing businesses with recurring needs",
    features: [
      "Unlimited bookings",
      "Priority support",
      "Shared team access",
      "Invoice & payment tracking",
    ],
    cta: "Choose Growth",
    href: "/book-consultation",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-entity and high-volume operations",
    features: [
      "Dedicated relationship manager",
      "Custom SLAs",
      "White-label branding",
      "Advanced reporting",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlighted: false,
  },
];
