"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage, unwrapData } from "@/lib/api-helpers";
import StatusBadge from "@/components/portal/StatusBadge";
import { teamMembers } from "@/lib/portal-mock";
import type { User } from "@/context/AuthContext";

const tabs = [
  "Personal Profile",
  "Business Information",
  "Team Members",
  "Security",
  "Notifications",
  "Billing Preferences",
  "Danger Zone",
] as const;

type Tab = (typeof tabs)[number];

function SectionCard({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="text-headline-sm font-semibold text-on-surface">{title}</h2>
      {description && <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const notificationMatrix = [
  { key: "service-updates", label: "Service Status Updates" },
  { key: "invoices", label: "Invoices & Payments" },
  { key: "documents", label: "Document Requests" },
  { key: "meetings", label: "Meeting Reminders" },
  { key: "marketing", label: "Product Updates & Offers" },
];

const channels = ["Email", "SMS", "Push"] as const;

const PREFS_KEY = "oknitech.settings.prefs";

type PrefsStore = {
  notifications: Record<string, Record<(typeof channels)[number], boolean>>;
  business: Record<string, string>;
  billing: {
    autoPay: boolean;
    emailCopies: boolean;
    gstInclusive: boolean;
    billingEmail: string;
    currency: string;
  };
};

function defaultPrefs(user: User | null): PrefsStore {
  return {
    notifications: Object.fromEntries(
      notificationMatrix.map((n) => [
        n.key,
        { Email: true, SMS: n.key === "invoices" || n.key === "meetings", Push: true },
      ])
    ),
    business: {
      business_name: "",
      business_type: "",
      gstin: "",
      pan: "",
      address: "",
      industry: "",
      year: "",
    },
    billing: {
      autoPay: false,
      emailCopies: true,
      gstInclusive: true,
      billingEmail: user?.email_id ?? "",
      currency: "INR (₹)",
    },
  };
}

function loadPrefs(user: User | null): PrefsStore {
  if (typeof window === "undefined") return defaultPrefs(user);
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs(user);
    return { ...defaultPrefs(user), ...JSON.parse(raw) };
  } catch {
    return defaultPrefs(user);
  }
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Personal Profile");
  const [prefs, setPrefs] = useState<PrefsStore>(() => defaultPrefs(null));
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email_id: "",
    phone_number: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs(user));
    if (user) {
      setProfile({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email_id: user.email_id ?? "",
        phone_number: user.phone_number ?? "",
        address: "",
      });
      apiClient
        .get("/me")
        .then((res) => {
          const data = unwrapData<{ user: User & { address?: string } }>(res.data);
          const me = data.user;
          setProfile({
            first_name: me.first_name ?? "",
            last_name: me.last_name ?? "",
            email_id: me.email_id ?? "",
            phone_number: me.phone_number ?? "",
            address: me.address ?? "",
          });
          updateUser(me);
        })
        .catch(() => {
          /* keep local seed */
        });
    }
  }, [user?.id]);

  const persistPrefs = (next: PrefsStore) => {
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const flash = (ok: string | null, err: string | null = null) => {
    setStatusMsg(ok);
    setErrorMsg(err);
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    flash(null);
    try {
      const res = await apiClient.put("/me", profile);
      const data = unwrapData<{ user: User }>(res.data);
      updateUser(data.user);
      flash("Profile saved.");
    } catch (error) {
      flash(null, getApiErrorMessage(error, "Unable to save profile."));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    flash(null);
    try {
      await apiClient.post("/change-password", passwordForm);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      flash("Password updated.");
    } catch (error) {
      flash(null, getApiErrorMessage(error, "Unable to update password."));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3.5 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary-container";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-headline-lg font-semibold text-on-surface">Profile &amp; Settings</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Manage your account, business details, team, and preferences.
        </p>
      </div>

      {(statusMsg || errorMsg) && (
        <div
          className={`rounded-lg px-4 py-3 text-body-sm ${
            errorMsg ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {errorMsg || statusMsg}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-label-md font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary-fixed text-primary"
                : tab === "Danger Zone"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Personal Profile" && (
        <SectionCard title="Personal Information" description="Update your personal details and contact information.">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="mb-2 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-headline-sm font-semibold text-primary">
                {profile.first_name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <p className="text-label-sm text-on-surface-variant">
                Profile photo upload will use your avatar URL once media storage is configured.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">First Name</label>
                <input
                  className={inputClass}
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Last Name</label>
                <input
                  className={inputClass}
                  value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Email Address</label>
                <input
                  type="email"
                  className={inputClass}
                  value={profile.email_id}
                  onChange={(e) => setProfile((p) => ({ ...p, email_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Phone Number</label>
                <input
                  className={inputClass}
                  value={profile.phone_number}
                  onChange={(e) => setProfile((p) => ({ ...p, phone_number: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Address</label>
                <input
                  className={inputClass}
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-container px-5 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </SectionCard>
      )}

      {activeTab === "Business Information" && (
        <SectionCard title="Business Information" description="Stored locally for invoices and filings until CRM sync is enabled.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["business_name", "Business Name"],
              ["business_type", "Business Type"],
              ["gstin", "GSTIN"],
              ["pan", "PAN"],
              ["address", "Registered Address"],
              ["industry", "Industry"],
              ["year", "Year of Incorporation"],
            ].map(([key, label]) => (
              <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">{label}</label>
                <input
                  className={inputClass}
                  value={prefs.business[key] ?? ""}
                  onChange={(e) =>
                    persistPrefs({
                      ...prefs,
                      business: { ...prefs.business, [key]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => flash("Business details saved on this device.")}
            className="mt-6 rounded-lg bg-primary-container px-5 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            Save Changes
          </button>
        </SectionCard>
      )}

      {activeTab === "Team Members" && (
        <SectionCard title="Team Members" description="Team invites will sync to the API in a later release.">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => flash("Invite flow coming soon — ask your admin to add staff in the admin console.")}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
            >
              
              Invite Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="text-body-sm text-on-surface">
                    <td className="py-3 pr-4 font-medium">{member.name}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{member.email}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{member.role}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge label={member.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {activeTab === "Security" && (
        <SectionCard title="Password" description="Set a strong password to keep your account secure.">
          <form onSubmit={savePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 sm:max-w-md">
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Current Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">New Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Confirm New Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-container px-5 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {activeTab === "Notifications" && (
        <SectionCard title="Notification Preferences" description="Preferences are saved on this device.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                  <th className="pb-2 font-medium">Notification Type</th>
                  {channels.map((c) => (
                    <th key={c} className="pb-2 text-center font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {notificationMatrix.map((row) => (
                  <tr key={row.key} className="text-body-sm text-on-surface">
                    <td className="py-3 pr-4">{row.label}</td>
                    {channels.map((c) => (
                      <td key={c} className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={prefs.notifications[row.key]?.[c] ?? false}
                          onChange={() => {
                            const next = {
                              ...prefs,
                              notifications: {
                                ...prefs.notifications,
                                [row.key]: {
                                  ...prefs.notifications[row.key],
                                  [c]: !prefs.notifications[row.key]?.[c],
                                },
                              },
                            };
                            persistPrefs(next);
                          }}
                          className="h-4 w-4 rounded border-outline-variant text-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => flash("Notification preferences saved.")}
            className="mt-6 rounded-lg bg-primary-container px-5 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            Save Preferences
          </button>
        </SectionCard>
      )}

      {activeTab === "Billing Preferences" && (
        <SectionCard title="Billing Preferences" description="Control how invoices and receipts are delivered.">
          <div className="space-y-4">
            {(
              [
                ["autoPay", "Auto-pay outstanding invoices", "Automatically charge your primary payment method on due date."],
                ["emailCopies", "Email invoice copies", "Receive a PDF copy of every invoice via email."],
                ["gstInclusive", "GST-inclusive invoicing", "Show invoice totals inclusive of applicable GST."],
              ] as const
            ).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-outline-variant/40 p-4">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">{label}</p>
                  <p className="text-label-sm text-on-surface-variant">{desc}</p>
                </div>
                <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(prefs.billing[key])}
                    onChange={() =>
                      persistPrefs({
                        ...prefs,
                        billing: { ...prefs.billing, [key]: !prefs.billing[key] },
                      })
                    }
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary-container" />
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Billing Email</label>
              <input
                className={inputClass}
                value={prefs.billing.billingEmail}
                onChange={(e) =>
                  persistPrefs({
                    ...prefs,
                    billing: { ...prefs.billing, billingEmail: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Preferred Invoice Currency
              </label>
              <input
                className={inputClass}
                value={prefs.billing.currency}
                onChange={(e) =>
                  persistPrefs({
                    ...prefs,
                    billing: { ...prefs.billing, currency: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </SectionCard>
      )}

      {activeTab === "Danger Zone" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-headline-sm font-semibold text-amber-800">Deactivate Account</h2>
            <p className="mt-1 text-body-sm text-amber-700">
              Contact support to temporarily disable your account. Self-serve deactivation is not enabled yet.
            </p>
            <a
              href="/support"
              className="mt-4 inline-block rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-label-md font-medium text-amber-800 hover:bg-amber-100"
            >
              Contact Support
            </a>
          </section>
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="text-headline-sm font-semibold text-rose-800">Delete Account</h2>
            <p className="mt-1 text-body-sm text-rose-700">
              Permanent deletion requires a support ticket so we can close open bookings and invoices safely.
            </p>
            <a
              href="/support"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-4 py-2.5 text-label-md font-medium text-white hover:bg-rose-700"
            >
              Request Deletion
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
