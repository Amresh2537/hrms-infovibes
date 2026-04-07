import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { startOfDay, endOfDay } from "@/lib/date";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

export async function GET(request: NextRequest) {
  try {
    await requireRole("HR");
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const fromParam = searchParams.get("fromDate");
    const toParam = searchParams.get("toDate");
    const department = searchParams.get("department") ?? "";

    let dayStart: Date;
    let dayEnd: Date;

    if (fromParam && toParam) {
      const from = new Date(fromParam);
      const to = new Date(toParam);
      dayStart = startOfDay(isNaN(from.getTime()) ? new Date() : from);
      dayEnd = endOfDay(isNaN(to.getTime()) ? new Date() : to);
    } else {
      let targetDate: Date;
      if (dateParam) {
        targetDate = new Date(dateParam);
        if (isNaN(targetDate.getTime())) targetDate = new Date();
      } else {
        targetDate = new Date();
      }
      dayStart = startOfDay(targetDate);
      dayEnd = endOfDay(targetDate);
    }

    const employeeQuery: Record<string, unknown> = { status: "active" };
    if (department) employeeQuery.department = department;

    const [employees, attendances, departments] = await Promise.all([
      Employee.find(employeeQuery).select("name empCode department designation").lean(),
      Attendance.find({ date: { $gte: dayStart, $lte: dayEnd } }).lean(),
      Employee.distinct("department"),
    ]);

    // Build map for fast lookup
    const attendanceMap = new Map(
      attendances.map((a) => [String(a.employeeId), a]),
    );

    const rows = employees.map((emp) => {
      const record = attendanceMap.get(String(emp._id));
      return {
        employeeId: String(emp._id),
        name: emp.name,
        empCode: emp.empCode,
        department: emp.department,
        designation: emp.designation,
        checkInTime: record?.checkInTime ?? null,
        checkOutTime: record?.checkOutTime ?? null,
        status: record?.status ?? "Absent",
        location: record?.location ?? null,
        distanceFromOffice: record?.distanceFromOffice ?? null,
        isWFH: record?.isWFH ?? false,
        lastActiveAt: record?.lastActiveAt ?? null,
        selfieUrl: record?.selfieUrl ?? null,
        checkOutSelfieUrl: record?.checkOutSelfieUrl ?? null,
      };
    });

    return jsonOk({ rows, departments });
  } catch (error) {
    return handleRouteError(error);
  }
}
