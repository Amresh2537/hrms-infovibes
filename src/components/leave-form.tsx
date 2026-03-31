"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LeaveForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/leave/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: String(formData.get("type") ?? "CL"),
        fromDate: String(formData.get("fromDate") ?? ""),
        toDate: String(formData.get("toDate") ?? ""),
        reason: String(formData.get("reason") ?? ""),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Leave request failed.");
      return;
    }

    setMessage("Leave request submitted for approval.");
    startTransition(() => router.refresh());
  }

  return (
    <form action={handleSubmit} className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-[#1e293b]">Apply For Leave</h2>
        <p className="mt-0.5 text-xs text-[#64748b]">Submit CL, SL, or other leave requests.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">
          <span>Leave Type</span>
          <select
            name="type"
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 outline-none transition focus:border-[#0f766e]"
          >
            <option value="CL">Casual Leave</option>
            <option value="SL">Sick Leave</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>From Date</span>
          <input
            name="fromDate"
            type="date"
            required
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 outline-none transition focus:border-[#0f766e]"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>To Date</span>
          <input
            name="toDate"
            type="date"
            required
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 outline-none transition focus:border-[#0f766e]"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium md:col-span-2">
          <span>Reason</span>
          <textarea
            name="reason"
            rows={4}
            required
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 outline-none transition focus:border-[#0f766e]"
          />
        </label>
      </div>

      {message ? <p className="mt-4 text-sm text-[#0f766e]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-[#ef4444]">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-lg bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Apply Leave"}
      </button>
    </form>
  );
}
