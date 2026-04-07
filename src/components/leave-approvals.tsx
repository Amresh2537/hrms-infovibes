"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type LeaveRow = {
  _id: string;
  type: string;
  fromDate: string | Date;
  toDate: string | Date;
  proofUrl?: string;
  employeeId?: {
    name?: string;
    empCode?: string;
    department?: string;
  };
};

export function LeaveApprovals({ leaves }: { leaves: LeaveRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function updateLeave(leaveId: string, status: "Approved" | "Rejected") {
    setError(null);

    const response = await fetch("/api/leave/approve", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ leaveId, status }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Leave status update failed.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
        <h2 className="font-semibold text-[#1e293b]">Pending Leave Approvals</h2>
      </div>

      {error ? <p className="px-6 pt-4 text-sm text-danger">{error}</p> : null}

      <div className="divide-y divide-[#e2e8f0]">
        {leaves.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-[#64748b]">No pending leave requests.</p>
        ) : (
          leaves.map((leave) => (
            <div key={leave._id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <div className="truncate font-medium text-[#1e293b]">
                  {leave.employeeId?.name ?? "Unknown"}{" "}
                  <span className="text-xs font-semibold text-brand">{leave.type}</span>
                </div>
                <div className="truncate text-xs text-[#64748b]">
                  {leave.employeeId?.department ?? "-"}
                </div>
                {leave.proofUrl ? (
                  <a href={leave.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block truncate text-xs font-medium text-brand hover:underline">
                    View Proof
                  </a>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateLeave(leave._id, "Approved")}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateLeave(leave._id, "Rejected")}
                  className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748b] transition hover:bg-[#f1f5f9] disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}