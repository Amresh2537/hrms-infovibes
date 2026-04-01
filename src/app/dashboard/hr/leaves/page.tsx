"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LeaveRow = {
  _id: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  employeeId?: {
    _id: string;
    name?: string;
    empCode?: string;
    department?: string;
  };
};

function dayCount(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

function fmt(val: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(val));
}

const statusCls: Record<string, string> = {
  Pending: "bg-[#fef9c3] text-[#854d0e]",
  Approved: "bg-[#dcfce7] text-[#166534]",
  Rejected: "bg-[#fee2e2] text-[#991b1b]",
};

const statusLabel: Record<string, string> = {
  Pending: "pending",
  Approved: "sanctioned",
  Rejected: "declined",
};

export default function HrLeavesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function fetchData(status: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/leave?${params}`);
    if (res.ok) {
      const json = await res.json();
      setLeaves(json.leaves ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData(statusFilter);
  }, [statusFilter]);

  async function updateLeave(leaveId: string, status: "Approved" | "Rejected") {
    const res = await fetch("/api/leave/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveId, status }),
    });
    if (res.ok) {
      await fetchData(statusFilter);
      startTransition(() => router.refresh());
    }
  }

  const total = leaves.length;
  const pending = leaves.filter((l) => l.status === "Pending").length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">Leave Management System</h1>
        <p className="mt-1 text-sm text-[#64748b]">Process employee leave applications</p>
      </div>

      {/* Filter + action */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#374151]">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => fetchData(statusFilter)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Generate Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Applications", value: total, bg: "bg-[#dbeafe]", color: "text-[#1d4ed8]", emoji: "📋" },
          { label: "Pending", value: pending, bg: "bg-[#fef9c3]", color: "text-[#854d0e]", emoji: "⏳" },
          { label: "Sanctioned", value: approved, bg: "bg-[#dcfce7]", color: "text-[#166534]", emoji: "✅" },
          { label: "Declined", value: rejected, bg: "bg-[#fee2e2]", color: "text-[#991b1b]", emoji: "❌" },
        ].map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.bg} ${card.color}`}>
              {card.emoji}
            </div>
            <div>
              <div className="text-sm text-[#64748b]">{card.label}</div>
              <div className="mt-0.5 text-2xl font-bold text-[#1e293b]">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-sm text-[#64748b]">Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#64748b]">
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => {
                    const emp = leave.employeeId;
                    const days = dayCount(leave.fromDate, leave.toDate);
                    const typeLabel =
                      leave.type === "CL" ? "Casual" : leave.type === "SL" ? "Sick" : leave.type;

                    return (
                      <tr key={leave._id} className="hover:bg-[#f8fafc]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-xs font-bold text-[#4f46e5]">
                              {emp?.name?.slice(0, 2).toUpperCase() ?? "??"}
                            </div>
                            <div>
                              <div className="font-medium text-[#1e293b]">{emp?.name ?? "Unknown"}</div>
                              <div className="text-xs text-[#64748b]">{emp?.department ?? "-"}</div>
                              <div className="text-xs text-[#94a3b8]">
                                Applied on {fmt(leave.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#1e293b]">{typeLabel}</td>
                        <td className="px-6 py-4">
                          <div className="text-[#1e293b]">
                            {fmt(leave.fromDate)} to {fmt(leave.toDate)}
                          </div>
                          <div className="text-xs text-[#64748b]">
                            {days} {days === 1 ? "day" : "days"}
                          </div>
                        </td>
                        <td className="max-w-[180px] px-6 py-4 text-[#475569]">
                          <div className="truncate">{leave.reason}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              statusCls[leave.status] ?? "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            {statusLabel[leave.status] ?? leave.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {leave.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => updateLeave(leave._id, "Approved")}
                                className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => updateLeave(leave._id, "Rejected")}
                                className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-[#64748b]">View Details</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
