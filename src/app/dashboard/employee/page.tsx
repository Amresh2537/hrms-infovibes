import { AttendanceActions } from "@/components/attendance-actions";
import { LeaveForm } from "@/components/leave-form";
import { requireSession } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/date";
import { getEmployeeDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";

export default async function EmployeeDashboardPage() {
  const session = await requireSession();

  if (!session.employeeId) {
    redirect("/login");
  }

  const data = await getEmployeeDashboardData(session.employeeId);

  if (!data.employee) {
    redirect("/login");
  }

  const leaveBalance = data.employee.leaveBalance ?? { CL: 0, SL: 0 };
  const approvedLeaves = data.leaves.filter((leave) => leave.status === "Approved").length;
  const todayStatus = data.todayAttendance?.status ?? "Not marked";

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">My Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748b]">Welcome back, {data.employee.name}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            todayStatus === "Present" ? "bg-green-100 text-green-700" :
            todayStatus === "Late" ? "bg-yellow-100 text-yellow-700" :
            "bg-slate-100 text-slate-600"
          }`}
        >
          Today: {todayStatus}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            </div>
            <div>
              <div className="text-xs text-[#64748b]">Employee Code</div>
              <div className="text-xl font-bold text-[#1e293b]">{data.employee.empCode}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className="text-xs text-[#64748b]">Joining Date</div>
              <div className="text-base font-bold text-[#1e293b]">{formatDate(data.employee.joinDate)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div className="text-xs text-[#64748b]">CL Balance</div>
              <div className="text-2xl font-bold text-[#1e293b]">{leaveBalance.CL}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div>
              <div className="text-xs text-[#64748b]">Leaves Approved</div>
              <div className="text-2xl font-bold text-[#1e293b]">{approvedLeaves}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <AttendanceActions
            hasCheckedIn={Boolean(data.todayAttendance?.checkInTime)}
            employeeName={data.employee.name}
            officePosition={
              data.employee.workLocation
                ? {
                    lat: data.employee.workLocation.lat,
                    lng: data.employee.workLocation.lng,
                  }
                : undefined
            }
          />
          <LeaveForm />
        </div>

        {/* Recent Attendance */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <h2 className="text-base font-semibold text-[#1e293b]">Recent Attendance</h2>
            <p className="text-xs text-[#64748b]">Your latest check-in records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Check Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {data.attendances.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-[#94a3b8]">No attendance records yet.</td></tr>
                ) : (
                  data.attendances.map((attendance) => (
                    <tr key={String(attendance._id)}>
                      <td className="px-4 py-3 font-medium text-[#1e293b]">{formatDate(attendance.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`status-badge status-badge-${attendance.status.toLowerCase()}`}>{attendance.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[#64748b]">{formatDateTime(attendance.checkInTime)}</td>
                      <td className="px-4 py-3 text-[#64748b]">{formatDateTime(attendance.checkOutTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leave History */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="border-b border-[#e2e8f0] px-6 py-4">
          <h2 className="text-base font-semibold text-[#1e293b]">Leave History</h2>
          <p className="text-xs text-[#64748b]">Track your submitted leave applications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {data.leaves.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#94a3b8]">No leave requests submitted yet.</td></tr>
              ) : (
                data.leaves.map((leave) => (
                  <tr key={String(leave._id)}>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{leave.type}</td>
                    <td className="px-4 py-3 text-[#64748b]">{formatDate(leave.fromDate)}</td>
                    <td className="px-4 py-3 text-[#64748b]">{formatDate(leave.toDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge status-badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
