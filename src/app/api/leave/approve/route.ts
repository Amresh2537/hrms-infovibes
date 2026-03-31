import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { leaveApprovalSchema } from "@/lib/validation";
import Employee from "@/models/Employee";
import Leave from "@/models/Leave";

function getLeaveDays(fromDate: Date, toDate: Date) {
  const difference = toDate.getTime() - fromDate.getTime();
  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole("HR");
    const body = await request.json();
    const payload = leaveApprovalSchema.parse(body);

    await connectToDatabase();

    const leave = await Leave.findById(payload.leaveId);

    if (!leave) {
      return jsonError("Leave request not found.", 404);
    }

    leave.status = payload.status;
    await leave.save();

    if (payload.status === "Approved" && leave.type !== "Other") {
      const employee = await Employee.findById(leave.employeeId);

      if (employee?.leaveBalance) {
        const leaveDays = getLeaveDays(leave.fromDate, leave.toDate);
        const leaveType = leave.type as "CL" | "SL";
        const currentBalance = employee.leaveBalance[leaveType] ?? 0;
        employee.leaveBalance[leaveType] = Math.max(0, currentBalance - leaveDays);
        await employee.save();
      }
    }

    return jsonOk({ leave });
  } catch (error) {
    return handleRouteError(error);
  }
}