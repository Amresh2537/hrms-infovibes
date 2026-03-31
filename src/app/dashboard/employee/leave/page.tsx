import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { formatDate } from "@/lib/date";
import Employee from "@/models/Employee";
import Leave from "@/models/Leave";
import { LeaveForm } from "@/components/leave-form";

export default async function EmployeeLeavePage() {
  const session = await requireSession();

  if (!session.employeeId) {
    redirect("/login");
  }

  await connectToDatabase();

  const [employee, leaves] = await Promise.all([
    Employee.findById(session.employeeId).lean(),
    Leave.find({ employeeId: session.employeeId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!employee) redirect("/login");

  const leaveBalance = employee.leaveBalance ?? { CL: 0, SL: 0 };

  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  const clUsed = leaves.filter((l) => l.type === "CL" && l.status === "Approved").length;
  const slUsed = leaves.filter((l) => l.type === "SL" && l.status === "Approved").length;

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          My Leaves
        </div>
        <h1 className="text-2xl font-bold text-[#1e293b]">Leave Management</h1>
        <p className="mt-1 text-sm text-[#64748b]">Apply for leave and track your requests.</p>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          label="CL Balance"
          value={leaveBalance.CL}
          used={clUsed}
          color="bg-indigo-50 border-indigo-100"
          valueColor="text-indigo-700"
        />
        <BalanceCard
          label="SL Balance"
          value={leaveBalance.SL}
          used={slUsed}
          color="bg-teal-50 border-teal-100"
          valueColor="text-teal-700"
        />
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748b]">Total Applied</div>
          <div className="mt-1 text-2xl font-bold text-[#1e293b]">{leaves.length}</div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748b]">Pending Approval</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {leaves.filter((l) => l.status === "Pending").length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Apply form */}
        <LeaveForm />

        {/* Leave History */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <h2 className="text-base font-semibold text-[#1e293b]">Leave History</h2>
            <p className="text-xs text-[#64748b]">All your submitted leave requests</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#94a3b8]">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={String(leave._id)}>
                      <td className="px-4 py-3 font-medium text-[#1e293b]">{leave.type}</td>
                      <td className="px-4 py-3 text-[#64748b]">{formatDate(leave.fromDate)}</td>
                      <td className="px-4 py-3 text-[#64748b]">{formatDate(leave.toDate)}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-[#64748b]">
                        {leave.reason ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusColor[leave.status] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  used,
  color,
  valueColor,
}: {
  label: string;
  value: number;
  used: number;
  color: string;
  valueColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${color}`}>
      <div className="text-xs text-[#64748b]">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className="mt-1 text-xs text-[#64748b]">{used} used</div>
    </div>
  );
}
