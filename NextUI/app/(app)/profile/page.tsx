"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage, unwrapData } from "@/lib/api-helpers";

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setPhone(user.phone_number ?? "");
    setAddress(user.address ?? "");
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await apiClient.put("/me", {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || undefined,
        address: address || undefined,
      });
      const data = unwrapData<{ user?: typeof user }>(res.data);
      if (data.user) updateUser(data.user);
      else {
        updateUser({
          ...user!,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          address,
        });
      }
      setMsg("Profile updated.");
    } catch (error) {
      setErr(getApiErrorMessage(error, "Unable to update profile"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return <p className="text-body-md text-on-surface-variant">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-headline-lg text-on-surface">Profile</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Manage your customer account details.{" "}
          <Link href="/settings" className="text-primary hover:underline">
            Open full settings
          </Link>
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6"
      >
        {msg && <p className="text-body-sm text-emerald-700">{msg}</p>}
        {err && <p className="text-body-sm text-rose-700">{err}</p>}

        <div>
          <label className="mb-1.5 block text-label-md text-on-surface-variant">Email</label>
          <input
            value={user.email_id}
            disabled
            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3.5 py-2.5 text-body-sm text-on-surface-variant"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-label-md text-on-surface-variant">First name</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-label-md text-on-surface-variant">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-label-md text-on-surface-variant">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-label-md text-on-surface-variant">Address</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
