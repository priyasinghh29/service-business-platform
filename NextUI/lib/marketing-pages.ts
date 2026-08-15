// Shared mock content for marketing pages (About, Services, Industries, Book Consultation, GST Registration).

export const aboutPrinciples = [
  {
    icon: "security",
    title: "Integrity",
    description: "We do what's right, even when no one is watching, in every engagement we undertake.",
  },
  {
    icon: "computer",
    title: "Transparency",
    description: "Clear communication and honest pricing with no hidden fees or surprise invoices.",
  },
  {
    icon: "groups",
    title: "Client Success",
    description: "Your goals are our goals. We measure our success by the outcomes we deliver for you.",
  },
  {
    icon: "app_registration",
    title: "Innovation",
    description: "We continuously modernize our processes with technology to serve you faster.",
  },
  {
    icon: "task",
    title: "Accountability",
    description: "We own our commitments and stand behind every deliverable we produce.",
  },
  {
    icon: "sell",
    title: "Excellence",
    description: "We hold ourselves to the highest professional standards in every engagement.",
  },
  {
    icon: "gavel",
    title: "Confidentiality",
    description: "Your business information is protected with strict compliance and security protocols.",
  },
  {
    icon: "support_agent",
    title: "Continuous Improvement",
    description: "We invest in our people and systems to keep raising the bar for client service.",
  },
];

export const leadershipTeam = [
  {
    name: "David Chen",
    role: "Chief Executive Officer",
    initials: "DC",
    bio: "20+ years leading professional services firms with a focus on client-first digital transformation.",
  },
  {
    name: "Sarah Thompson",
    role: "Chief Operating Officer",
    initials: "ST",
    bio: "Oversees service delivery and client operations, ensuring consistent quality across every engagement.",
  },
  {
    name: "Marcus Vane",
    role: "Head of Tax & Compliance",
    initials: "MV",
    bio: "Leads our tax advisory practice, bringing deep regulatory expertise across multiple jurisdictions.",
  },
  {
    name: "Elena Rosas",
    role: "Head of Legal Advisory",
    initials: "ER",
    bio: "Guides our legal team on corporate structuring, contracts, and regulatory representation.",
  },
];

export const companyTimeline = [
  { year: "2009", title: "Firm Founded", description: "Started as a boutique accounting practice serving local small businesses." },
  { year: "2013", title: "Legal & Compliance Added", description: "Expanded into legal advisory and regulatory compliance services." },
  { year: "2017", title: "100th Enterprise Client", description: "Crossed our first major milestone serving mid-market and enterprise clients." },
  { year: "2020", title: "Digital Platform Launched", description: "Introduced our secure client portal for document sharing and case tracking." },
  { year: "2022", title: "National Expansion", description: "Opened regional offices to support clients across multiple states." },
  { year: "2024", title: "500+ Clients Served", description: "Now serving over 500 businesses across 8 industries with a 99% satisfaction rate." },
];

export const accreditations = [
  { icon: "security", label: "ISO 27001 Certified" },
  { icon: "gavel", label: "Bar Council Registered" },
  { icon: "account_balance", label: "Certified Public Accountants" },
  { icon: "task", label: "SOC 2 Type II Compliant" },
];

export const csrInitiatives = [
  {
    icon: "school",
    title: "Financial Literacy Program",
    description: "Free workshops helping small business owners understand taxation and compliance basics.",
  },
  {
    icon: "groups",
    title: "Pro Bono Advisory",
    description: "Dedicated hours each quarter supporting registered non-profits with legal and accounting needs.",
  },
  {
    icon: "medical_services",
    title: "Community Health Drives",
    description: "Annual sponsorship of health camps in partnership with local community organizations.",
  },
];

export const aboutFaqs = [
  {
    question: "How long has Oknitech Serve been in business?",
    answer: "We were established in 2009 and have grown to serve over 500 clients across 8 industries with a track record of measurable results.",
  },
  {
    question: "What industries do you specialize in?",
    answer: "We work extensively with startups, IT, healthcare, manufacturing, retail, real estate, education, and logistics businesses, tailoring our services to each sector's regulatory needs.",
  },
  {
    question: "Do you offer services outside of accounting and tax?",
    answer: "Yes. Beyond accounting and tax, we provide company registration, legal advisory, GST compliance, payroll, trademark filing, and startup incorporation services.",
  },
  {
    question: "How do I get started working with your team?",
    answer: "Simply book a complimentary consultation through our online scheduler. A relationship manager will be assigned to guide you through onboarding.",
  },
];

export const expertiseCards = [
  {
    icon: "account_balance",
    title: "Accounting",
    description: "Full-cycle bookkeeping, financial statements, and real-time ledger access through our portal.",
    href: "/services",
  },
  {
    icon: "task",
    title: "Tax Compliance",
    description: "End-to-end tax planning, filing, and advisory to keep your business fully compliant.",
    href: "/services",
  },
  {
    icon: "app_registration",
    title: "Company Registration",
    description: "Seamless entity formation, licensing, and statutory registrations to launch faster.",
    href: "/services",
  },
  {
    icon: "gavel",
    title: "Legal",
    description: "Corporate legal advisory, contract drafting, and regulatory representation.",
    href: "/services",
  },
  {
    icon: "payments",
    title: "GST",
    description: "GST registration, filing, and reconciliation handled by certified compliance experts.",
    href: "/services/gst-registration",
  },
  {
    icon: "groups",
    title: "Payroll",
    description: "Automated payroll processing with integrated statutory filings and benefits management.",
    href: "/services",
  },
  {
    icon: "sell",
    title: "Trademark",
    description: "Trademark search, filing, and protection to safeguard your brand identity.",
    href: "/services",
  },
  {
    icon: "support_agent",
    title: "Startup",
    description: "End-to-end incorporation packages designed specifically for early-stage founders.",
    href: "/services",
  },
];

export const featuredPackages = [
  {
    name: "GST Registration",
    price: "$299",
    period: "one-time",
    description: "Complete GST registration with document preparation and filing support.",
    features: ["Application filing", "Document verification", "ARN tracking", "3-5 day turnaround"],
    href: "/services/gst-registration",
    highlighted: false,
  },
  {
    name: "Income Tax Filing",
    price: "$449",
    period: "per filing",
    description: "Accurate, optimized income tax return preparation and e-filing.",
    features: ["Tax computation", "Deduction optimization", "E-filing & acknowledgement", "Dedicated CA review"],
    href: "/book-consultation",
    highlighted: true,
  },
  {
    name: "Company Incorporation",
    price: "$899",
    period: "one-time",
    description: "Full incorporation package from name approval to certificate of incorporation.",
    features: ["Name reservation", "MOA/AOA drafting", "Digital signatures", "PAN & TAN registration"],
    href: "/book-consultation",
    highlighted: false,
  },
];

export const whyChooseUsServices = [
  { icon: "support_agent", title: "Dedicated Relationship Manager", description: "A single point of contact who understands your business end-to-end." },
  { icon: "sell", title: "Transparent, Flat-Fee Pricing", description: "No hidden costs. You know exactly what you'll pay before we begin." },
  { icon: "security", title: "Bank-Grade Security", description: "Your documents are encrypted and stored in compliance-ready infrastructure." },
  { icon: "task", title: "On-Time Delivery Guarantee", description: "We commit to clear timelines and keep you updated at every milestone." },
];

export const serviceProcessSteps = [
  { step: 1, title: "Consult", description: "Share your requirements in a free consultation call." },
  { step: 2, title: "Propose", description: "Receive a tailored scope and transparent quote." },
  { step: 3, title: "Onboard", description: "Sign engagement letter and get portal access." },
  { step: 4, title: "Submit", description: "Upload documents securely through your dashboard." },
  { step: 5, title: "Execute", description: "Our experts complete filings and deliverables." },
  { step: 6, title: "Deliver", description: "Receive final documents and ongoing support." },
];

export const successStories = [
  {
    name: "Priya Nair",
    company: "Founder, Beanstalk Retail",
    quote: "Oknitech Serve handled our GST and incorporation seamlessly. What used to take weeks now takes days.",
    result: "Incorporated in 7 days",
  },
  {
    name: "James Okafor",
    company: "COO, Vertex Manufacturing",
    quote: "Their payroll and compliance team caught issues our previous provider missed entirely. True peace of mind.",
    result: "100% compliance record",
  },
  {
    name: "Linh Tran",
    company: "CEO, Northwind Health Clinics",
    quote: "The dedicated relationship manager model makes all the difference. It genuinely feels like an in-house team.",
    result: "40% faster filings",
  },
];

export const servicesFaqs = [
  {
    question: "How quickly can you start on a new engagement?",
    answer: "Most engagements begin within 24-48 hours of your consultation call, once the scope and documents are confirmed.",
  },
  {
    question: "Are your packages customizable?",
    answer: "Yes, every package can be tailored. We'll recommend add-ons or a custom scope based on your business complexity.",
  },
  {
    question: "Do you support businesses outside major cities?",
    answer: "Our services are delivered digitally through our secure portal, so we support clients nationwide regardless of location.",
  },
  {
    question: "What happens if I need ongoing support after the project?",
    answer: "Many clients transition to a retainer plan for continuous compliance, filing, and advisory support.",
  },
];

export const industrySectors = [
  {
    icon: "support_agent",
    title: "Startups",
    description: "Incorporation, compliance, and fundraising-ready financial structuring for early-stage teams.",
    href: "/industries",
  },
  {
    icon: "computer",
    title: "IT & Technology",
    description: "SaaS revenue recognition, R&D tax credits, and cross-border compliance for tech companies.",
    href: "/industries",
  },
  {
    icon: "medical_services",
    title: "Healthcare",
    description: "Regulatory licensing, HIPAA-aligned processes, and specialized healthcare accounting.",
    href: "/industries",
  },
  {
    icon: "factory",
    title: "Manufacturing",
    description: "Inventory accounting, GST input credit optimization, and factory compliance filings.",
    href: "/industries",
  },
  {
    icon: "shopping_cart",
    title: "Retail",
    description: "Multi-channel sales tax handling, POS reconciliation, and e-commerce GST support.",
    href: "/industries",
  },
  {
    icon: "apartment",
    title: "Real Estate",
    description: "RERA compliance, project accounting, and transaction structuring for developers and brokers.",
    href: "/industries",
  },
  {
    icon: "school",
    title: "Education",
    description: "Non-profit and for-profit institution accounting, grant compliance, and payroll management.",
    href: "/industries",
  },
  {
    icon: "local_shipping",
    title: "Logistics",
    description: "Fleet expense tracking, interstate GST compliance, and freight contract advisory.",
    href: "/industries",
  },
];

export const industryPainPoints = [
  {
    industry: "Startups",
    painPoint: "Slow incorporation and unclear compliance calendar",
    ourSolution: "7-day incorporation with automated compliance reminders",
  },
  {
    industry: "IT & Technology",
    painPoint: "Complex multi-state and cross-border tax exposure",
    ourSolution: "Dedicated tech tax specialists with cross-border expertise",
  },
  {
    industry: "Healthcare",
    painPoint: "Fragmented licensing and regulatory documentation",
    ourSolution: "Centralized compliance tracker with renewal alerts",
  },
  {
    industry: "Manufacturing",
    painPoint: "Manual inventory reconciliation causing GST mismatches",
    ourSolution: "Automated inventory-to-GST reconciliation workflows",
  },
  {
    industry: "Retail",
    painPoint: "Inconsistent tax handling across sales channels",
    ourSolution: "Unified multi-channel tax engine with single dashboard",
  },
];

export const industryBundles = [
  {
    name: "Startup Launch Bundle",
    price: "$1,199",
    description: "Everything a new company needs in its first 90 days.",
    features: ["Incorporation", "GST registration", "Founder agreements", "First payroll setup"],
  },
  {
    name: "Growth Compliance Bundle",
    price: "$2,499",
    description: "For scaling businesses managing multi-state operations.",
    features: ["Multi-state GST filing", "Payroll for up to 25 employees", "Quarterly tax advisory", "Annual audit prep"],
  },
  {
    name: "Enterprise Retainer",
    price: "Custom",
    description: "Dedicated compliance team embedded in your operations.",
    features: ["Dedicated account team", "Unlimited filings", "Priority legal support", "Quarterly business reviews"],
  },
];

export const industryStats = [
  { value: "8", label: "Industries Served" },
  { value: "500+", label: "Businesses Supported" },
  { value: "15+", label: "Years of Domain Expertise" },
  { value: "99%", label: "Compliance Accuracy" },
];

export const industriesFaqs = [
  {
    question: "Do you have specialists dedicated to specific industries?",
    answer: "Yes, each sector team is staffed with professionals who have direct experience in that industry's regulatory landscape.",
  },
  {
    question: "Can bundles be customized per industry?",
    answer: "Absolutely. Our bundles are starting points; we adjust scope, pricing, and deliverables based on your specific sector needs.",
  },
  {
    question: "How do you stay current with changing industry regulations?",
    answer: "Our compliance team monitors regulatory updates continuously and proactively notifies clients of changes affecting their business.",
  },
];

export const consultationBenefits = [
  { icon: "support_agent", title: "Expert Guidance", description: "Speak directly with a specialist in your area of need, not a generic sales rep." },
  { icon: "sell", title: "No Obligation", description: "The consultation is completely complimentary with zero commitment required." },
  { icon: "task", title: "Custom Roadmap", description: "Walk away with a clear, actionable plan tailored to your business." },
  { icon: "security", title: "Confidential", description: "Everything discussed is protected under strict confidentiality agreements." },
];

export const whatHappensNext = [
  "We confirm your appointment via email and SMS.",
  "Your assigned specialist reviews your intake form.",
  "You'll receive a calendar invite with a video call link.",
  "We'll discuss your requirements in a focused 30-minute session.",
  "You'll receive a tailored proposal within 24 hours.",
  "Choose to proceed and get matched with your relationship manager.",
];

export const consultationFaqs = [
  {
    question: "Is the consultation really free?",
    answer: "Yes, the 30-minute initial consultation is completely complimentary with no hidden charges.",
  },
  {
    question: "What should I prepare before the call?",
    answer: "Having a rough idea of your business structure and any specific documents or deadlines helps us give more precise guidance.",
  },
  {
    question: "Can I reschedule my consultation?",
    answer: "Yes, you can reschedule up to 2 hours before your slot directly from the confirmation email.",
  },
];

export const consultationRequirementOptions = [
  "Accounting & Bookkeeping",
  "Tax Compliance",
  "Company Registration",
  "Legal Advisory",
  "GST Registration & Filing",
  "Payroll Management",
  "Trademark Registration",
  "Startup Incorporation",
];

export const consultationTimeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

export const gstBenefits = [
  { icon: "task", title: "Legal Compliance", description: "Stay fully compliant with GST regulations and avoid penalties or legal complications." },
  { icon: "payments", title: "Input Tax Credit", description: "Claim input tax credits on your purchases, reducing your overall tax liability." },
  { icon: "groups", title: "Business Credibility", description: "GST registration boosts credibility with vendors, customers, and financial institutions." },
  { icon: "app_registration", title: "Interstate Trade", description: "Enables seamless interstate sales and expands your business reach nationally." },
];

export const gstIncludes = [
  "Eligibility assessment and application preparation",
  "Document verification and formatting",
  "Online application submission",
  "ARN generation and tracking",
  "Follow-up with GST department on queries",
  "GSTIN certificate delivery",
];

export const gstDocChecklist = [
  "PAN card of business/proprietor",
  "Proof of business registration or incorporation certificate",
  "Identity and address proof of promoters/directors",
  "Address proof of business premises",
  "Bank account statement or cancelled cheque",
  "Digital signature certificate (for companies/LLPs)",
];

export const gstPackages = [
  {
    name: "Starter",
    price: "$299",
    description: "Ideal for sole proprietors and small businesses.",
    features: ["GST application filing", "Document preparation", "ARN tracking", "Email support"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$499",
    description: "Best for growing businesses with multiple registrations.",
    features: ["Everything in Starter", "Priority processing", "1 amendment included", "Dedicated specialist"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For businesses with multi-state or complex GST needs.",
    features: ["Multi-state registration", "Ongoing GST filing support", "Compliance calendar", "Dedicated account manager"],
    highlighted: false,
  },
];

export const gstProcessSteps = [
  { step: 1, title: "Consult", description: "Discuss your business structure and GST requirements." },
  { step: 2, title: "Document", description: "Submit required documents through our secure portal." },
  { step: 3, title: "Verify", description: "We review and verify all documentation for accuracy." },
  { step: 4, title: "File", description: "Application is submitted on the GST portal on your behalf." },
  { step: 5, title: "Track", description: "We monitor and respond to any department queries." },
  { step: 6, title: "Deliver", description: "Receive your GSTIN certificate and welcome kit." },
];

export const gstFaqs = [
  {
    question: "Who needs GST registration?",
    answer: "Businesses with turnover above the prescribed threshold, or those engaged in interstate supply and e-commerce, are required to register for GST.",
  },
  {
    question: "How long does GST registration take?",
    answer: "Typically 3-5 business days from submission of complete documentation, subject to department processing times.",
  },
  {
    question: "What happens if my application is rejected?",
    answer: "We handle resubmission at no extra cost within the Professional and Enterprise packages, addressing any department queries directly.",
  },
  {
    question: "Can I upgrade my package later?",
    answer: "Yes, you can upgrade to a higher package at any time, and we'll credit the difference from your original payment.",
  },
];

export const gstRelatedServices = [
  { icon: "task", title: "Income Tax Filing", description: "Accurate return preparation and e-filing for individuals and businesses.", href: "/services" },
  { icon: "app_registration", title: "Company Registration", description: "Full incorporation support from name approval to certificate issuance.", href: "/services" },
  { icon: "payments", title: "Payroll Management", description: "End-to-end payroll processing with statutory compliance built in.", href: "/services" },
];
