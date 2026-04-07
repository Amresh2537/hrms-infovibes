import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";
import Settings from "@/models/Settings";
import { CreateEmployeeForm } from "@/components/create-employee-form";
import { EmployeeRowActions } from "@/components/employee-row-actions";
import { EmployeesHeaderActions } from "@/components/employees-header-actions";
import { formatDate } from "@/lib/date";

export default async function HrEmployeesPage() {
  await requireRole("HR");
  await connectToDatabase();
  const [employees, settings] = await Promise.all([
    Employee.find().sort({ createdAt: -1 }).lean(),
    Settings.findOne({ singleton: "global" }).lean(),
  ]);

  const branches = (settings?.branches ?? []).map((branch) => ({
    id: String(branch._id),
    name: branch.name,
    address: branch.address ?? "",
    lat: branch.lat,
    lng: branch.lng,
    radius: branch.radius ?? 500,
  }));

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
        <EmployeesHeaderActions />
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Working Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Leaves Benefit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">No of Days Working</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Working Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">CL / SL</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-10 text-center text-sm text-[#64748b]">
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
                        <td className="px-6 py-4 text-[#475569]">{emp.workingStatus ?? "Full-time"}</td>
                        <td className="px-6 py-4 text-[#475569]">{emp.leavesBenefit ?? "Standard"}</td>
                        <td className="px-6 py-4 text-[#475569]">{emp.daysWorking ?? 5}</td>
                        <td className="px-6 py-4 text-[#475569]">
                          {branches.find((branch) => branch.id === (emp.branchId ?? ""))?.name ?? "Custom Location"}
                        </td>
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
                          <EmployeeRowActions employeeId={String(emp._id)} employeeName={emp.name} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>
        </div>
      </div>

      <CreateEmployeeForm branches={branches} />
    </div>
  );
}
