"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import {
  fetchPublicApi,
  getApiErrorMessage,
  toBookingTime,
  tomorrowIsoDate,
  unwrapData,
} from "@/lib/api-helpers";
import type { CatalogService } from "@/lib/catalog-types";
import {
  consultationBenefits,
  whatHappensNext,
  consultationFaqs,
  consultationRequirementOptions,
  consultationTimeSlots,
} from "@/lib/marketing-pages";

const steps = ["Personal", "Company", "Requirements", "Schedule", "Review"];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  industry: string;
  requirements: string[];
  timeSlot: string;
  bookingDate: string;
  notes: string;
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  companySize: "",
  industry: "",
  requirements: [],
  timeSlot: "",
  bookingDate: tomorrowIsoDate(),
  notes: "",
};

function MetaChips() {
  return (
    <div className="flex flex-wrap items-center gap-md text-body-sm text-on-surface-variant">
      <span className="flex items-center gap-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-md py-xs">
        
        30 mins
      </span>
      <span className="flex items-center gap-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-md py-xs">
        
        Online
      </span>
      <span className="flex items-center gap-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-md py-xs">
        
        Complimentary
      </span>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-xl flex items-center justify-between">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-xs">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-label-sm font-bold transition-colors ${
                  isComplete
                    ? "bg-primary text-on-primary"
                    : isActive
                      ? "border-2 border-primary bg-surface-container-lowest text-primary"
                      : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`hidden text-label-sm sm:block ${
                  isActive ? "font-bold text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${isComplete ? "bg-primary" : "bg-outline-variant/50"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-xs block text-label-md font-medium text-on-surface">{children}</label>;
}

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function BookConsultationPage() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [service, setService] = useState<CatalogService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPublicApi<CatalogService>("/services/business-consultation").then((data) => {
      if (data) setService(data);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || user.first_name || "",
        lastName: prev.lastName || user.last_name || "",
        email: prev.email || user.email_id || "",
        phone: prev.phone || user.phone_number || "",
      }));
    }
  }, [user]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRequirement = (item: string) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(item)
        ? prev.requirements.filter((r) => r !== item)
        : [...prev.requirements, item],
    }));
  };

  const canContinue = () => {
    if (step === 0) return form.firstName && form.lastName && form.email && form.phone;
    if (step === 1) return form.companyName && form.companySize && form.industry;
    if (step === 2) return form.requirements.length > 0;
    if (step === 3) return Boolean(form.timeSlot && form.bookingDate);
    return true;
  };

  const submitBooking = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/book-consultation")}`);
      return;
    }
    if (!service) {
      setError("Consultation service is not available yet. Please try again shortly.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiClient.put("/me", {
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phone,
      });
      updateUser({
        ...user,
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phone,
      });

      const notes = [
        `Company: ${form.companyName} (${form.companySize}, ${form.industry})`,
        `Interests: ${form.requirements.join(", ")}`,
        form.notes ? `Notes: ${form.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await apiClient.post("/bookings", {
        service_id: service.id,
        booking_date: form.bookingDate,
        booking_time: toBookingTime(form.timeSlot),
        package_name: "Complimentary consultation",
        customer_notes: notes,
      });
      const booking = unwrapData<{ id: number }>(res.data);
      setBookingId(booking.id);
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to book consultation."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      void submitBooking();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <MarketingLayout>
      <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
        <div className="mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
          <h1 className="mb-lg font-display text-[2rem] font-bold leading-tight tracking-tight text-on-surface md:text-display">
            Schedule a Consultation with Our Experts
          </h1>
          <p className="mx-auto mb-lg max-w-2xl text-body-lg text-on-surface-variant">
            Tell us about your business and requirements, and we&apos;ll match you with the right specialist for a
            complimentary, no-obligation session.
          </p>
          <div className="flex justify-center">
            <MetaChips />
          </div>
        </div>
      </section>

      <section className="pb-xxl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-gutter px-margin-mobile md:px-margin-desktop lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center py-xxl text-center">
                <h2 className="mb-sm font-display text-headline-md text-on-surface">Consultation Booked</h2>
                <p className="mb-xl max-w-md text-body-md text-on-surface-variant">
                  Thanks, {form.firstName || "there"}! Your complimentary consultation is scheduled for{" "}
                  {form.bookingDate} at {form.timeSlot}. Track it anytime in My Services.
                </p>
                <div className="flex flex-wrap justify-center gap-md">
                  <Link
                    href={bookingId ? `/my-services/${bookingId}` : "/my-services"}
                    className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90"
                  >
                    View Booking
                  </Link>
                  <Link
                    href="/services"
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                  >
                    Explore Services
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <StepIndicator currentStep={step} />
                {error && (
                  <div className="mb-lg rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">
                    {error}
                  </div>
                )}
                {!user && !authLoading && (
                  <div className="mb-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800">
                    You&apos;ll need to{" "}
                    <Link href={`/login?redirect=/book-consultation`} className="font-medium underline">
                      sign in
                    </Link>{" "}
                    before submitting.
                  </div>
                )}

                {step === 0 && (
                  <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
                    <div>
                      <FieldLabel>First Name</FieldLabel>
                      <input
                        className={inputClass}
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="Jordan"
                      />
                    </div>
                    <div>
                      <FieldLabel>Last Name</FieldLabel>
                      <input
                        className={inputClass}
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="Blake"
                      />
                    </div>
                    <div>
                      <FieldLabel>Email Address</FieldLabel>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="jordan@company.com"
                      />
                    </div>
                    <div>
                      <FieldLabel>Phone Number</FieldLabel>
                      <input
                        type="tel"
                        className={inputClass}
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+1 (800) 555-0123"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FieldLabel>Company Name</FieldLabel>
                      <input
                        className={inputClass}
                        value={form.companyName}
                        onChange={(e) => update("companyName", e.target.value)}
                        placeholder="Beanstalk Retail Inc."
                      />
                    </div>
                    <div>
                      <FieldLabel>Company Size</FieldLabel>
                      <select
                        className={inputClass}
                        value={form.companySize}
                        onChange={(e) => update("companySize", e.target.value)}
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="200+">200+ employees</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Industry</FieldLabel>
                      <select
                        className={inputClass}
                        value={form.industry}
                        onChange={(e) => update("industry", e.target.value)}
                      >
                        <option value="">Select industry</option>
                        <option value="startups">Startups</option>
                        <option value="it">IT &amp; Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="education">Education</option>
                        <option value="logistics">Logistics</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <FieldLabel>Which services are you interested in?</FieldLabel>
                    <div className="mt-md grid grid-cols-1 gap-sm sm:grid-cols-2">
                      {consultationRequirementOptions.map((option) => {
                        const checked = form.requirements.includes(option);
                        return (
                          <button
                            type="button"
                            key={option}
                            onClick={() => toggleRequirement(option)}
                            className={`flex items-center gap-sm rounded-lg border px-md py-sm text-left text-body-sm transition-colors ${
                              checked
                                ? "border-primary bg-primary/5 text-on-surface"
                                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                checked ? "border-primary bg-primary text-on-primary" : "border-outline-variant"
                              }`}
                            >
                              {checked ? "✓" : ""}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-lg">
                      <FieldLabel>Additional Notes (optional)</FieldLabel>
                      <textarea
                        className={`${inputClass} min-h-[100px] resize-none`}
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Tell us more about your requirements..."
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <FieldLabel>Preferred date</FieldLabel>
                    <input
                      type="date"
                      className={`${inputClass} mb-lg`}
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.bookingDate}
                      onChange={(e) => update("bookingDate", e.target.value)}
                    />
                    <FieldLabel>Select a preferred time slot</FieldLabel>
                    <div className="mt-md grid grid-cols-2 gap-sm sm:grid-cols-4">
                      {consultationTimeSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => update("timeSlot", slot)}
                          className={`rounded-lg border px-md py-sm text-body-sm font-medium transition-colors ${
                            form.timeSlot === slot
                              ? "border-primary bg-primary-container text-on-primary"
                              : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-lg">
                    <h3 className="font-display text-headline-sm text-on-surface">Review Your Details</h3>
                    <div className="grid grid-cols-1 gap-md rounded-lg border border-outline-variant/50 bg-surface-container-low p-lg sm:grid-cols-2">
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Name</p>
                        <p className="text-body-md text-on-surface">
                          {form.firstName} {form.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Email</p>
                        <p className="text-body-md text-on-surface">{form.email}</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Phone</p>
                        <p className="text-body-md text-on-surface">{form.phone}</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Company</p>
                        <p className="text-body-md text-on-surface">{form.companyName}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-label-sm text-on-surface-variant">Services</p>
                        <p className="text-body-md text-on-surface">{form.requirements.join(", ") || "None selected"}</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Date</p>
                        <p className="text-body-md text-on-surface">{form.bookingDate}</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Preferred Time</p>
                        <p className="text-body-md text-on-surface">{form.timeSlot}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-xl flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || submitting}
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!canContinue() || submitting}
                    className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {step === steps.length - 1 ? (submitting ? "Booking…" : "Submit Request") : "Continue"}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="space-y-lg">
            <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
              <h3 className="mb-xs font-display text-headline-sm text-on-surface">Need Immediate Help?</h3>
              <p className="mb-lg text-body-sm text-on-surface-variant">
                Speak with our support team right away for urgent inquiries.
              </p>
              <div className="space-y-sm text-body-sm text-on-surface">
                <div className="flex items-center gap-xs">
                  
                  +1 (800) 555-0123
                </div>
                <div className="flex items-center gap-xs">
                  
                  info@oknitech.serve
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
              <h3 className="mb-lg font-display text-headline-sm text-on-surface">Why Book?</h3>
              <div className="space-y-lg">
                {consultationBenefits.map((item) => (
                  <div key={item.title} className="flex gap-md">
                    <div>
                      <p className="text-label-md font-bold text-on-surface">{item.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
              <h3 className="mb-lg font-display text-headline-sm text-on-surface">What Happens Next</h3>
              <ol className="space-y-md">
                {whatHappensNext.map((item, index) => (
                  <li key={item} className="flex gap-md text-body-sm text-on-surface-variant">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-xxl">
        <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
          <h2 className="mb-xxl text-center font-display text-headline-lg text-on-surface">Frequently Asked Questions</h2>
          <FaqAccordion items={consultationFaqs} />
        </div>
      </section>
    </MarketingLayout>
  );
}
