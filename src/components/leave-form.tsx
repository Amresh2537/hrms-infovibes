"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LeaveForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    let proofUrl: string | undefined;
    if (proofFile) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", proofFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json() as { url?: string; error?: string };
        if (!uploadRes.ok) {
          setError(uploadData.error ?? "Proof upload failed.");
          return;
        }
        proofUrl = uploadData.url;
      } finally {
        setIsUploading(false);
      }
    }

    const response = await fetch("/api/leave/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: String(formData.get("type") ?? "CL"),
        fromDate: String(formData.get("fromDate") ?? ""),
        toDate: String(formData.get("toDate") ?? ""),
        reason: String(formData.get("reason") ?? ""),
        ...(proofUrl ? { proofUrl } : {}),
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
        <div className="block space-y-2 text-sm font-medium md:col-span-2">
          <span>Proof Document <span className="font-normal text-[#64748b]">(Optional)</span></span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm text-[#374151] transition hover:bg-[#f1f5f9]"
            >
              {proofFile ? proofFile.name : "Choose file"}
            </button>
            {proofFile && (
              <button
                type="button"
                onClick={() => {
                  setProofFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-[#ef4444] hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-[#94a3b8]">Accepted: image or PDF, max 5 MB</p>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-[#0f766e]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-[#ef4444]">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending || isUploading}
        className="mt-6 rounded-lg bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
      >
        {isUploading ? "Uploading proof..." : isPending ? "Submitting..." : "Apply Leave"}
      </button>
    </form>
  );
}
