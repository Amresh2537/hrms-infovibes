import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { endOfDay, startOfDay } from "@/lib/date";
import { haversineDistanceInMeters, isWithinWorkRadius } from "@/lib/geo";
import { getAttendanceRules, resolveStatusFromRules, timeToMinutes } from "@/lib/attendance-rules";
import { attendanceCheckInSchema } from "@/lib/validation";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const payload = attendanceCheckInSchema.parse(body);

    if (!session.employeeId) {
      return jsonError("Employee profile is not linked to this account.", 400);
    }

    await connectToDatabase();

    const [employee, rules] = await Promise.all([
      Employee.findById(session.employeeId).lean(),
      getAttendanceRules(),
    ]);

    if (!employee) {
      return jsonError("Employee not found.", 404);
    }

    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existingAttendance?.checkInTime) {
      return jsonError("Attendance has already been marked for today.", 409);
    }

    const now = new Date();

    // Block check-in after the absentAfter threshold (compare in IST)
    const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const nowMinutes = nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();
    const absentMinutes = timeToMinutes(rules.absentAfter);
    if (nowMinutes >= absentMinutes) {
      return jsonError(
        `Check-in is not allowed after ${rules.absentAfter}. You will be marked Absent for today.`,
        403,
      );
    }

    // WFH path – no geo check required
    if (payload.isWFH) {
      const attendance = await Attendance.findOneAndUpdate(
        { employeeId: employee._id, date: todayStart },
        {
          employeeId: employee._id,
          date: todayStart,
          checkInTime: now,
          status: "WorkFromHome",
          isWFH: true,
          distanceFromOffice: 0,
          lastActiveAt: now,
          ...(payload.selfieUrl ? { selfieUrl: payload.selfieUrl } : {}),
        },
        { upsert: true, new: true, runValidators: true },
      ).lean();
      return jsonOk({ attendance });
    }

    // Office check-in – geo check required
    if (!employee.workLocation) {
      return jsonError("Work location is not configured for this employee.", 400);
    }

    if (payload.lat == null || payload.lng == null) {
      return jsonError("Location coordinates are required for office check-in.", 400);
    }

    const distance = haversineDistanceInMeters(
      employee.workLocation.lat,
      employee.workLocation.lng,
      payload.lat,
      payload.lng,
    );
    const isInsideRadius = isWithinWorkRadius(distance, employee.workLocation.radius);
    const status = resolveStatusFromRules(now, isInsideRadius, rules);

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date: todayStart },
      {
        employeeId: employee._id,
        date: todayStart,
        checkInTime: now,
        location: {
          lat: payload.lat,
          lng: payload.lng,
        },
        status,
        isWFH: false,
        distanceFromOffice: Math.round(distance),
        ...(payload.selfieUrl ? { selfieUrl: payload.selfieUrl } : {}),
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return jsonOk({ attendance });
  } catch (error) {
    return handleRouteError(error);
  }
}
