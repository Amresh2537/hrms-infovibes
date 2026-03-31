import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { endOfMonth, startOfMonth } from "@/lib/date";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";

export async function GET(request: NextRequest) {
  try {
    await requireRole("HR");
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());
    const employeeId = searchParams.get("employeeId");

    const range = {
      $gte: startOfMonth(year, month),
      $lte: endOfMonth(year, month),
    };

    const attendanceFilter = employeeId ? { employeeId, date: range } : { date: range };
    const leaveFilter = employeeId
      ? { employeeId, fromDate: range, status: "Approved" }
      : { fromDate: range, status: "Approved" };

    const [attendances, approvedLeaves] = await Promise.all([
      Attendance.find(attendanceFilter).populate("employeeId", "name empCode department").lean(),
      Leave.find(leaveFilter).populate("employeeId", "name empCode department").lean(),
    ]);

    const present = attendances.filter((record) => record.status === "Present").length;
    const late = attendances.filter((record) => record.status === "Late").length;
    const outsideLocation = attendances.filter(
      (record) => record.status === "Outside Location",
    ).length;
    const approvedLeaveDays = approvedLeaves.reduce((total, leave) => {
      const difference = leave.toDate.getTime() - leave.fromDate.getTime();
      return total + Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
    }, 0);

    return jsonOk({
      month,
      year,
      totals: {
        records: attendances.length,
        present,
        late,
        outsideLocation,
        approvedLeaves: approvedLeaves.length,
        totalPaidLeaves: approvedLeaveDays,
      },
      attendances,
      approvedLeaves,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}