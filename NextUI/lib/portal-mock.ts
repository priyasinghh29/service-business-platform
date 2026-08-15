// Shared mock data for the Oknitech Serve client portal.
// Replace with live API data once backend endpoints are wired up.

export type PipelineStage = "Consult" | "Proposal" | "Submission" | "Review" | "Complete";

export interface Service {
  id: string;
  name: string;
  category: string;
  status: "In Progress" | "Review" | "Completed" | "Pending" | "Overdue";
  progress: number;
  owner: string;
  dueDate: string;
  stage: PipelineStage;
  description: string;
}

export const services: Service[] = [
  {
    id: "gst-registration",
    name: "GST Annual Registration",
    category: "Tax & Compliance",
    status: "In Progress",
    progress: 65,
    owner: "Arun Kumar",
    dueDate: "Oct 28, 2026",
    stage: "Submission",
    description: "Annual GST registration renewal and filing for FY 2026-27.",
  },
  {
    id: "trademark-filing",
    name: "Trademark Filing",
    category: "Intellectual Property",
    status: "Pending",
    progress: 30,
    owner: "Priya Sharma",
    dueDate: "Nov 02, 2026",
    stage: "Review",
    description: "Trademark class 42 filing for brand wordmark and logo.",
  },
  {
    id: "statutory-audit",
    name: "Statutory Audit",
    category: "Audit & Assurance",
    status: "Review",
    progress: 85,
    owner: "Sanjay Mehta",
    dueDate: "Oct 25, 2026",
    stage: "Review",
    description: "FY 2025-26 statutory audit — awaiting supplementary documents.",
  },
  {
    id: "roc-annual-filing",
    name: "ROC Annual Filing",
    category: "Corporate Compliance",
    status: "Completed",
    progress: 100,
    owner: "Arun Kumar",
    dueDate: "Sep 30, 2026",
    stage: "Complete",
    description: "Annual return and financial statement filing with ROC.",
  },
  {
    id: "payroll-compliance",
    name: "Payroll Compliance Review",
    category: "HR & Payroll",
    status: "Overdue",
    progress: 45,
    owner: "Neha Verma",
    dueDate: "Oct 18, 2026",
    stage: "Proposal",
    description: "PF/ESI compliance health check across all employee records.",
  },
];

export const serviceStats = {
  active: 4,
  completed: 8,
  pending: 3,
  overdue: 1,
  upcoming: 2,
};

export const pipelineStages: PipelineStage[] = [
  "Consult",
  "Proposal",
  "Submission",
  "Review",
  "Complete",
];

export interface DocumentItem {
  id: string;
  name: string;
  folder: string;
  size: string;
  uploadedBy: string;
  uploadedOn: string;
  type: "pdf" | "doc" | "xls" | "img";
}

export const documents: DocumentItem[] = [
  { id: "d1", name: "GST_Certificate_2026.pdf", folder: "Tax & Compliance", size: "2.4 MB", uploadedBy: "Arun Kumar", uploadedOn: "Oct 12, 2026", type: "pdf" },
  { id: "d2", name: "Board_Resolution_Trademark.docx", folder: "Intellectual Property", size: "540 KB", uploadedBy: "Priya Sharma", uploadedOn: "Oct 10, 2026", type: "doc" },
  { id: "d3", name: "FY25-26_Audit_TrialBalance.xlsx", folder: "Audit & Assurance", size: "1.1 MB", uploadedBy: "Sanjay Mehta", uploadedOn: "Oct 08, 2026", type: "xls" },
  { id: "d4", name: "PAN_Card_Copy.pdf", folder: "KYC Documents", size: "310 KB", uploadedBy: "You", uploadedOn: "Oct 05, 2026", type: "pdf" },
  { id: "d5", name: "Payroll_Register_Sep2026.xlsx", folder: "HR & Payroll", size: "890 KB", uploadedBy: "Neha Verma", uploadedOn: "Oct 02, 2026", type: "xls" },
  { id: "d6", name: "Office_Address_Proof.jpg", folder: "KYC Documents", size: "1.8 MB", uploadedBy: "You", uploadedOn: "Sep 28, 2026", type: "img" },
];

export const documentFolders = [
  { name: "Tax & Compliance", count: 12 },
  { name: "Intellectual Property", count: 6 },
  { name: "Audit & Assurance", count: 9 },
  { name: "KYC Documents", count: 5 },
  { name: "HR & Payroll", count: 8 },
  { name: "Contracts & Agreements", count: 4 },
];

export const pendingDocumentRequests = [
  { id: "r1", title: "Bank Statement (Last 6 months)", requestedBy: "Sanjay Mehta", dueDate: "Oct 20, 2026" },
  { id: "r2", title: "Directors' KYC (Updated)", requestedBy: "Arun Kumar", dueDate: "Oct 22, 2026" },
  { id: "r3", title: "Logo Vector File (AI/EPS)", requestedBy: "Priya Sharma", dueDate: "Oct 26, 2026" },
];

export interface Invoice {
  id: string;
  number: string;
  service: string;
  amount: number;
  status: "Paid" | "Outstanding" | "Overdue" | "Draft";
  issuedOn: string;
  dueOn: string;
}

export const invoices: Invoice[] = [
  { id: "inv1", number: "INV-2026-0142", service: "GST Annual Registration", amount: 18450, status: "Outstanding", issuedOn: "Oct 10, 2026", dueOn: "Nov 05, 2026" },
  { id: "inv2", number: "INV-2026-0138", service: "Statutory Audit", amount: 45000, status: "Paid", issuedOn: "Sep 22, 2026", dueOn: "Oct 06, 2026" },
  { id: "inv3", number: "INV-2026-0129", service: "ROC Annual Filing", amount: 12000, status: "Paid", issuedOn: "Sep 05, 2026", dueOn: "Sep 20, 2026" },
  { id: "inv4", number: "INV-2026-0121", service: "Trademark Filing", amount: 9500, status: "Overdue", issuedOn: "Aug 28, 2026", dueOn: "Sep 12, 2026" },
  { id: "inv5", number: "INV-2026-0110", service: "Payroll Compliance Review", amount: 7200, status: "Paid", issuedOn: "Aug 10, 2026", dueOn: "Aug 25, 2026" },
];

export const invoiceKpis = {
  totalOutstanding: 27950,
  paidThisYear: 312400,
  overdueCount: 1,
  nextDueDate: "Nov 05, 2026",
};

export const paymentMethods = [
  { id: "pm1", label: "HDFC Bank Credit Card", detail: "•••• •••• •••• 4821", primary: true },
  { id: "pm2", label: "ICICI Bank Account", detail: "A/C •••• 6790", primary: false },
];

export const subscriptions = [
  { id: "s1", name: "Compliance Retainer — Standard", cadence: "Monthly", amount: 6000, renewsOn: "Nov 01, 2026" },
  { id: "s2", name: "Virtual CFO Advisory", cadence: "Quarterly", amount: 25000, renewsOn: "Dec 15, 2026" },
];

export const quotations = [
  { id: "q1", title: "Trademark Renewal — Class 35 & 42", amount: 15000, status: "Awaiting Approval", validTill: "Oct 30, 2026" },
  { id: "q2", title: "International Tax Advisory", amount: 60000, status: "Under Review", validTill: "Nov 10, 2026" },
];

export const taxDocuments = [
  { id: "t1", name: "Form 16A — Q2 FY26-27", date: "Oct 01, 2026" },
  { id: "t2", name: "TDS Certificate — Sep 2026", date: "Sep 28, 2026" },
];

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  with: string;
  mode: "Video Call" | "In Person" | "Phone Call";
}

export const meetings: MeetingItem[] = [
  { id: "m1", title: "GST Filing Review", date: "Today", time: "2:00 PM", with: "Arun Kumar", mode: "Video Call" },
  { id: "m2", title: "Trademark Strategy Discussion", date: "Oct 06, 2026", time: "11:30 AM", with: "Priya Sharma", mode: "Phone Call" },
  { id: "m3", title: "Audit Closing Meeting", date: "Oct 09, 2026", time: "4:00 PM", with: "Sanjay Mehta", mode: "In Person" },
];

export const deadlines = [
  { id: "dl1", title: "GST Return Submission", date: "Oct 28, 2026", priority: "High" as const },
  { id: "dl2", title: "Trademark Response Filing", date: "Nov 02, 2026", priority: "Medium" as const },
  { id: "dl3", title: "Audit Document Submission", date: "Oct 25, 2026", priority: "High" as const },
];

export const pendingRsvps = [
  { id: "rs1", title: "Quarterly Business Review", date: "Oct 15, 2026", time: "3:00 PM" },
  { id: "rs2", title: "Tax Planning Workshop", date: "Oct 20, 2026", time: "10:00 AM" },
];

export const calendarIntegrations = [
  { id: "ci1", name: "Google Calendar", connected: true },
  { id: "ci2", name: "Outlook Calendar", connected: false },
  { id: "ci3", name: "Apple Calendar", connected: false },
];

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved" | "Waiting on You";
  priority: "Low" | "Medium" | "High";
  updatedOn: string;
}

export const tickets: Ticket[] = [
  { id: "tk1", subject: "Clarification on GST late fee", category: "Tax & Compliance", status: "In Progress", priority: "Medium", updatedOn: "Oct 12, 2026" },
  { id: "tk2", subject: "Need duplicate audit report copy", category: "Audit & Assurance", status: "Waiting on You", priority: "Low", updatedOn: "Oct 10, 2026" },
  { id: "tk3", subject: "Invoice mismatch for INV-2026-0121", category: "Billing", status: "Open", priority: "High", updatedOn: "Oct 09, 2026" },
];

export const ticketKpis = {
  open: 2,
  inProgress: 1,
  resolvedThisMonth: 6,
  avgResponseTime: "3.2 hrs",
};

export const knowledgeBase = [
  { id: "kb1", title: "How GST Registration Works", category: "Tax & Compliance", reads: "1.2k" },
  { id: "kb2", title: "Trademark Filing Timeline Explained", category: "Intellectual Property", reads: "860" },
  { id: "kb3", title: "Understanding Your Invoice", category: "Billing", reads: "540" },
  { id: "kb4", title: "Preparing for a Statutory Audit", category: "Audit & Assurance", reads: "710" },
];

export const faqs = [
  { id: "f1", q: "How do I upload documents for my ongoing service?", a: "Go to My Services, open the relevant service card, and use the Document Manager section to upload files directly." },
  { id: "f2", q: "When will my GST registration be completed?", a: "Your GST Annual Registration is currently at 65% and is estimated to complete by Oct 28, 2026." },
  { id: "f3", q: "How can I pay an outstanding invoice?", a: "Visit the Invoices page and click Pay Now next to the relevant invoice, or use the Pending Invoice shortcut on your dashboard." },
  { id: "f4", q: "Can I reschedule a meeting with my relationship manager?", a: "Yes, open the Calendar page, select the meeting and choose Reschedule, or contact your relationship manager directly." },
];

export const teamMembers = [
  { id: "tm1", name: "Rohit Singh", email: "rohit.singh@example.com", role: "Admin", status: "Active" },
  { id: "tm2", name: "Kavita Rao", email: "kavita.rao@example.com", role: "Finance Manager", status: "Active" },
  { id: "tm3", name: "Aditya Nair", email: "aditya.nair@example.com", role: "Viewer", status: "Invited" },
];

export const relationshipManager = {
  name: "Arun Kumar",
  role: "Senior Relationship Manager",
  email: "arun.kumar@oknitechserve.com",
  phone: "+91 98765 43210",
  availability: "Mon–Sat, 9:30 AM – 6:30 PM",
};

export const supportContacts = {
  workingHours: "Mon–Sat, 9:30 AM – 6:30 PM IST",
  supportEmail: "support@oknitechserve.com",
  supportPhone: "+91 1800 123 4567",
};

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  group: "Today" | "Yesterday" | "This Week";
  category: "Service" | "Invoice" | "Document" | "Meeting" | "System";
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  time: string;
}

export const notifications: NotificationItem[] = [
  { id: "n1", title: "GST Registration moved to Submission stage", description: "Arun Kumar advanced your GST Annual Registration to the Submission stage.", group: "Today", category: "Service", read: false, actionLabel: "View Service", actionHref: "/my-services/gst-registration", time: "10:24 AM" },
  { id: "n2", title: "Invoice INV-2026-0142 is due soon", description: "Your outstanding invoice of ₹18,450 is due in 5 days.", group: "Today", category: "Invoice", read: false, actionLabel: "Pay Now", actionHref: "/invoices", time: "9:02 AM" },
  { id: "n3", title: "New document requested", description: "Sanjay Mehta requested your bank statement for the audit.", group: "Today", category: "Document", read: false, actionLabel: "Upload", actionHref: "/documents", time: "8:15 AM" },
  { id: "n4", title: "Meeting reminder: GST Filing Review", description: "Your meeting with Arun Kumar starts at 2:00 PM today.", group: "Today", category: "Meeting", read: true, actionLabel: "View Calendar", actionHref: "/calendar", time: "7:30 AM" },
  { id: "n5", title: "Trademark filing under review", description: "Priya Sharma is reviewing your trademark application.", group: "Yesterday", category: "Service", read: true, actionLabel: "View Service", actionHref: "/my-services/trademark-filing", time: "Yesterday" },
  { id: "n6", title: "Payment received", description: "We received your payment for INV-2026-0138 (₹45,000).", group: "Yesterday", category: "Invoice", read: true, time: "Yesterday" },
  { id: "n7", title: "Audit documents uploaded", description: "3 new documents were added to your Audit & Assurance folder.", group: "This Week", category: "Document", read: true, actionLabel: "View Documents", actionHref: "/documents", time: "Oct 12" },
  { id: "n8", title: "Password changed successfully", description: "Your account password was updated on Oct 10, 2026.", group: "This Week", category: "System", read: true, time: "Oct 10" },
];

export const notificationStats = {
  unread: 3,
  today: 4,
  actionRequired: 2,
  highPriority: 1,
};

export const accountHealth = {
  score: 92,
  label: "Excellent",
  notes: "All compliance filings are on track. 1 invoice pending payment.",
};

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", actor: "Arun Kumar", action: "moved GST Annual Registration to Submission stage", timestamp: "2 hours ago" },
  { id: "a2", actor: "You", action: "uploaded PAN_Card_Copy.pdf", timestamp: "5 hours ago" },
  { id: "a3", actor: "Priya Sharma", action: "requested Logo Vector File for Trademark Filing", timestamp: "Yesterday" },
  { id: "a4", actor: "Sanjay Mehta", action: "left a comment on Statutory Audit", timestamp: "Yesterday" },
  { id: "a5", actor: "System", action: "generated invoice INV-2026-0142", timestamp: "2 days ago" },
];

export const serviceProgressOverview = [
  { id: "gst-registration", name: "GST Annual Registration", progress: 65 },
  { id: "trademark-filing", name: "Trademark Filing", progress: 30 },
  { id: "statutory-audit", name: "Statutory Audit", progress: 85 },
  { id: "roc-annual-filing", name: "ROC Annual Filing", progress: 100 },
];

export const tasks = [
  { id: "task1", title: "Upload bank statement for audit", dueDate: "Oct 20, 2026", done: false },
  { id: "task2", title: "Review trademark application draft", dueDate: "Oct 22, 2026", done: false },
  { id: "task3", title: "Approve GST filing summary", dueDate: "Oct 24, 2026", done: false },
];

export const serviceCommunication = [
  { id: "c1", author: "Arun Kumar", role: "Relationship Manager", message: "We've submitted your GST application. Awaiting government acknowledgement, expected within 3-4 business days.", timestamp: "Oct 13, 2026 · 11:20 AM" },
  { id: "c2", author: "You", role: "Client", message: "Thanks for the update, please let me know once acknowledged.", timestamp: "Oct 13, 2026 · 11:45 AM" },
  { id: "c3", author: "Arun Kumar", role: "Relationship Manager", message: "Sure, will update this thread as soon as we hear back.", timestamp: "Oct 13, 2026 · 11:50 AM" },
];

export const assignedTeam = [
  { id: "at1", name: "Arun Kumar", role: "Relationship Manager", initials: "AK" },
  { id: "at2", name: "Divya Menon", role: "Compliance Associate", initials: "DM" },
];

export const milestones = {
  clientTasks: [
    { id: "ct1", title: "Share updated business PAN copy", done: true },
    { id: "ct2", title: "Confirm authorized signatory details", done: true },
    { id: "ct3", title: "Approve final GST application draft", done: false },
  ],
  firmTasks: [
    { id: "ft1", title: "Prepare GST application form", done: true },
    { id: "ft2", title: "Internal compliance review", done: true },
    { id: "ft3", title: "Submit to GST portal", done: false },
    { id: "ft4", title: "Track government acknowledgement", done: false },
  ],
};

export const actionItems = [
  { id: "ai1", title: "Approve final GST application draft", dueDate: "Oct 18, 2026", priority: "High" as const },
  { id: "ai2", title: "Confirm registered office address", dueDate: "Oct 20, 2026", priority: "Medium" as const },
];
