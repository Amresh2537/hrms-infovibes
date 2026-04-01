import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";
import { CreateEmployeeForm } from "@/components/create-employee-form";
import { formatDate } from "@/lib/date";

export default async function HrEmployeesPage() {
  await requireRole("HR");
  await connectToDatabase();
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Employees</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            A list of all employees in your company including their name, department, position and status.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/hr/employees/export"
            className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#1e293b] shadow-sm transition hover:bg-[#f8fafc]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Employee table */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">CL / SL</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#64748b]">
                      No employees yet. Add one using the form.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const lb = emp.leaveBalance ?? { CL: 0, SL: 0 };
                    const initials = emp.name.slice(0, 2).toUpperCase();
                    return (
                      <tr key={String(emp._id)} className="hover:bg-[#f8fafc]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-xs font-bold text-[#4f46e5]">
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium text-[#1e293b]">{emp.name}</div>
                              <div className="text-xs text-[#64748b]">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#475569]">{emp.department}</td>
                        <td className="px-6 py-4 text-[#475569]">{emp.designation}</td>
                        <td className="px-6 py-4 text-[#475569]">{formatDate(emp.joinDate)}</td>
                        <td className="px-6 py-4 text-[#475569]">{lb.CL} / {lb.SL}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              emp.status === "active"
                                ? "bg-[#dcfce7] text-[#166534]"
                                : "bg-[#fee2e2] text-[#991b1b]"
                            }`}
                          >
                            {emp.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/hr/employees/${String(emp._id)}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm transition hover:bg-[#f0fdf4] hover:border-[#0f766e] hover:text-[#0f766e]"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add employee form */}
        <CreateEmployeeForm />
      </div>
    </div>
  );
}
