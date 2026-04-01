import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getAttendanceRules } from "@/lib/attendance-rules";
import { formatDate, formatDateTime } from "@/lib/date";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { AttendanceActions } from "@/components/attendance-actions";
import { endOfDay, startOfDay } from "@/lib/date";

export default async function EmployeeAttendancePage() {
  const session = await requireSession();

  if (!session.employeeId) {
    redirect("/login");
  }

  await connectToDatabase();

  const [employee, todayAttendance, attendances, rules] = await Promise.all([
    Employee.findById(session.employeeId).lean(),
    Attendance.findOne({
      employeeId: session.employeeId,
      date: { $gte: startOfDay(), $lte: endOfDay() },
    }).lean(),
    Attendance.find({ employeeId: session.employeeId })
      .sort({ date: -1 })
      .limit(30)
      .lean(),
    getAttendanceRules(),
  ]);

  if (!employee) redirect("/login");

  const statusColor: Record<string, string> = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-yellow-100 text-yellow-700",
    "Half Day": "bg-orange-100 text-orange-700",
    Absent: "bg-red-100 text-red-700",
    "Outside Location": "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          My Attendance
        </div>
        <h1 className="text-2xl font-bold text-[#1e293b]">Attendance</h1>
        <p className="mt-1 text-sm text-[#64748b]">Mark attendance and view your history.</p>
      </div>

      {/* Attendance Rules Info */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1e293b]">Attendance Rules</h2>
        <p className="mt-0.5 text-xs text-[#64748b]">
          Your attendance status is determined based on the time you mark check-in.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RuleCard
            color="bg-green-100"
            dot="bg-green-500"
            label="Present"
            description={`Check-in before ${rules.lateMarkAfter}`}
          />
          <RuleCard
            color="bg-yellow-100"
            dot="bg-yellow-500"
            label="Late"
            description={`Check-in between ${rules.lateMarkAfter} – ${rules.halfDayAfter}`}
          />
          <RuleCard
            color="bg-orange-100"
            dot="bg-orange-500"
            label="Half Day"
            description={`Check-in between ${rules.halfDayAfter} – ${rules.absentAfter}`}
          />
          <RuleCard
            color="bg-red-100"
            dot="bg-red-500"
            label="Absent"
            description={`Check-in after ${rules.absentAfter} not allowed`}
          />
        </div>
        <div className="mt-3 rounded-lg bg-[#f0fdf4] px-4 py-2 text-xs text-[#166534]">
          Office shift starts at <strong>{rules.officeStartTime}</strong>. Arriving inside the
          designated radius marks you as on-site. Outside = "Outside Location".
        </div>
      </div>

      {/* Today's status + Check In/Out */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {todayAttendance ? (
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Today&apos;s Status
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    statusColor[todayAttendance.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {todayAttendance.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-[#64748b]">Check In</div>
                  <div className="font-medium text-[#1e293b]">
                    {formatDateTime(todayAttendance.checkInTime) ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#64748b]">Check Out</div>
                  <div className="font-medium text-[#1e293b]">
                    {formatDateTime(todayAttendance.checkOutTime) ?? "—"}
                  </div>
                </div>
                {todayAttendance.distanceFromOffice != null && (
                  <div>
                    <div className="text-xs text-[#64748b]">Distance from office</div>
                    <div className="font-medium text-[#1e293b]">
                      {todayAttendance.distanceFromOffice} m
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 text-center text-sm text-[#64748b]">
              No attendance marked for today yet.
            </div>
          )}
          <AttendanceActions hasCheckedIn={Boolean(todayAttendance?.checkInTime)} />
        </div>

        {/* Monthly summary */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1e293b]">This Month Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            {(["Present", "Late", "Half Day", "Absent", "Outside Location"] as const).map(
              (status) => {
                const count = attendances.filter((a) => a.status === status).length;
                return (
                  <div key={status} className="rounded-lg border border-[#e2e8f0] p-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusColor[status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {status}
                    </span>
                    <div className="mt-1 text-2xl font-bold text-[#1e293b]">{count}</div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Attendance history */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="border-b border-[#e2e8f0] px-6 py-4">
          <h2 className="text-base font-semibold text-[#1e293b]">Attendance History</h2>
          <p className="text-xs text-[#64748b]">Last 30 records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b]">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#94a3b8]">
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                attendances.map((record) => (
                  <tr key={String(record._id)}>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusColor[record.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {formatDateTime(record.checkInTime) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {formatDateTime(record.checkOutTime) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {record.distanceFromOffice != null ? `${record.distanceFromOffice} m` : "—"}
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

function RuleCard({
  color,
  dot,
  label,
  description,
}: {
  color: string;
  dot: string;
  label: string;
  description: string;
}) {
  return (
    <div className={`rounded-lg p-3 ${color}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mt-1 text-xs leading-snug opacity-80">{description}</p>
    </div>
  );
}
