import Link from "next/link";
import { LeaveApprovals } from "@/components/leave-approvals";
import { formatDateTime } from "@/lib/date";
import { getHrDashboardData } from "@/lib/dashboard";
import { requireRole } from "@/lib/auth";

export default async function HrDashboardPage() {
  await requireRole("HR");
  const data = await getHrDashboardData();

  const stats = [
    {
      label: "Total Employees",
      value: data.totalEmployees,
      sub: "Active headcount",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Present Today",
      value: data.presentToday,
      sub: "Checked in so far",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "On Leave",
      value: data.onLeaveToday,
      sub: "Approved leaves today",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending Requests",
      value: data.pendingLeaves,
      sub: "Awaiting approval",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const quickActions = [
    { label: "Add Employee",        desc: "Create a new employee record",         href: "/dashboard/hr/employees", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>) },
    { label: "Manage Attendance",   desc: "Review daily check-in records",        href: "/dashboard/hr/attendance", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>) },
    { label: "Leave Requests",      desc: "Approve or reject leave applications", href: "/dashboard/hr/leaves",     icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>) },
    { label: "Employee Directory",  desc: "Browse the full employee list",        href: "/dashboard/hr/employees", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>) },
    { label: "Reports",             desc: "Generate HR analytics reports",        href: "/reports",                icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>) },
    { label: "Settings",            desc: "Working hours, shifts and policy",     href: "/settings",               icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>) },
  ];

  return (
    <div className="space-y-8 p-6 md:p-8">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-[#0f172a]">Dashboard</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Overview of today&apos;s workforce activity.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-[#0f172a]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">{s.sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569] transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                {a.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1e293b]">{a.label}</p>
                <p className="text-xs text-[#94a3b8]">{a.desc}</p>
              </div>
              <svg className="ml-auto shrink-0 text-[#cbd5e1] transition group-hover:text-indigo-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Attendance + pending leaves */}
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">

        <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">Today&apos;s Attendance</p>
              <p className="text-xs text-[#94a3b8]">Most recent check-ins</p>
            </div>
            <Link href="/dashboard/hr/attendance" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Check In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {data.todayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-[#94a3b8]">
                      No attendance records for today.
                    </td>
                  </tr>
                ) : (
                  data.todayAttendance.slice(0, 6).map((record) => {
                    const emp = record.employeeId as { name?: string; department?: string } | undefined;
                    const statusCls: Record<string, string> = {
                      Present:            "bg-emerald-50 text-emerald-700",
                      Late:               "bg-amber-50 text-amber-700",
                      Absent:             "bg-red-50 text-red-700",
                      "Outside Location": "bg-indigo-50 text-indigo-700",
                    };
                    return (
                      <tr key={String(record._id)} className="hover:bg-[#fafafa]">
                        <td className="px-5 py-3 font-medium text-[#1e293b]">{emp?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-[#64748b]">{emp?.department ?? "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[record.status ?? ""] ?? "bg-slate-100 text-slate-600"}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#64748b]">{formatDateTime(record.checkInTime)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <LeaveApprovals leaves={JSON.parse(JSON.stringify(data.leaves))} />

      </div>
    </div>
  );
}