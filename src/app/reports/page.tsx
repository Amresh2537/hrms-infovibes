import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { connectToDatabase } from "@/lib/db";
import Leave from "@/models/Leave";
import Attendance from "@/models/Attendance";

export default async function ReportsPage() {
  const session = await requireRole("HR");
  await connectToDatabase();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [attendances, approvedLeaves] = await Promise.all([
    Attendance.find()
      .populate("employeeId", "name empCode")
      .sort({ date: -1 })
      .limit(12)
      .lean(),
    Leave.find({ status: "Approved" })
      .populate("employeeId", "name empCode")
      .sort({ fromDate: -1 })
      .limit(12)
      .lean(),
  ]);
  const presentCount = attendances.filter((attendance) => attendance.status === "Present").length;
  const lateCount = attendances.filter((attendance) => attendance.status === "Late").length;

  return (
    <AppShell role={session.role} name={session.name} email={session.email}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Reports</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Monthly reporting view — API: <code className="rounded bg-[#f1f5f9] px-1 py-0.5 text-xs">/api/reports/monthly?month={month}&year={year}</code>
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Attendance Records", value: attendances.length, color: "text-[#1d4ed8]" },
            { label: "Present Entries", value: presentCount, color: "text-[#166534]" },
            { label: "Late Entries", value: lateCount, color: "text-[#854d0e]" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="text-sm text-[#64748b]">{card.label}</div>
              <div className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="border-b border-[#e2e8f0] px-6 py-4">
              <h2 className="font-semibold text-[#1e293b]">Recent attendance records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {attendances.map((attendance) => {
                    const employee = attendance.employeeId as { name?: string } | undefined;
                    return (
                      <tr key={String(attendance._id)} className="hover:bg-[#f8fafc]">
                        <td className="px-6 py-3 font-medium text-[#1e293b]">{employee?.name ?? "-"}</td>
                        <td className="px-6 py-3 text-[#64748b]">{formatDate(attendance.date)}</td>
                        <td className="px-6 py-3 text-[#475569]">{attendance.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="border-b border-[#e2e8f0] px-6 py-4">
              <h2 className="font-semibold text-[#1e293b]">Approved leaves</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {approvedLeaves.map((leave) => {
                    const employee = leave.employeeId as { name?: string } | undefined;
                    return (
                      <tr key={String(leave._id)} className="hover:bg-[#f8fafc]">
                        <td className="px-6 py-3 font-medium text-[#1e293b]">{employee?.name ?? "-"}</td>
                        <td className="px-6 py-3 text-[#64748b]">{leave.type}</td>
                        <td className="px-6 py-3 text-[#64748b]">{formatDate(leave.fromDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
