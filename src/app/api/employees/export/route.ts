import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { handleRouteError } from "@/lib/api";
import Employee from "@/models/Employee";
import Settings from "@/models/Settings";

function csvEscape(value: unknown) {
  const raw = value == null ? "" : String(value);
  const escaped = raw.replaceAll('"', '""');
  return `"${escaped}"`;
}

export async function GET() {
  try {
    await requireRole("HR");
    await connectToDatabase();

    const [employees, settings] = await Promise.all([
      Employee.find().sort({ createdAt: -1 }).lean(),
      Settings.findOne({ singleton: "global" }).lean(),
    ]);

    const branchById = new Map(
      (settings?.branches ?? []).map((branch) => [String(branch._id), branch.name]),
    );

    const headers = [
      "Employee Code",
      "Name",
      "Email",
      "Phone",
      "Department",
      "Designation",
      "Working Status",
      "Leaves Benefit",
      "No of Days Working",
      "Working Location",
      "Join Date",
      "CL",
      "SL",
      "Status",
    ];

    const rows = employees.map((employee) => {
      const branchName = branchById.get(employee.branchId ?? "") ?? "Custom Location";
      return [
        employee.empCode,
        employee.name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
        employee.workingStatus ?? "Full-time",
        employee.leavesBenefit ?? "Standard",
        employee.daysWorking ?? 5,
        branchName,
        employee.joinDate ? new Date(employee.joinDate).toISOString().slice(0, 10) : "",
        employee.leaveBalance?.CL ?? 0,
        employee.leaveBalance?.SL ?? 0,
        employee.status,
      ];
    });

    const csvBody = [headers, ...rows]
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

    return new Response(csvBody, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="employees-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
