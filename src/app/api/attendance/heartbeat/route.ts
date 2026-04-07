import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { startOfDay, endOfDay } from "@/lib/date";
import Attendance from "@/models/Attendance";

/**
 * POST /api/attendance/heartbeat
 * Called every 2 minutes by WFH employees to record active time.
 * Updates lastActiveAt on today's attendance record.
 */
export async function POST() {
  try {
    const session = await requireSession();

    if (!session.employeeId) {
      return jsonError("Employee profile is not linked to this account.", 400);
    }

    await connectToDatabase();

    const attendance = await Attendance.findOne({
      employeeId: session.employeeId,
      date: { $gte: startOfDay(), $lte: endOfDay() },
    });

    if (!attendance?.checkInTime) {
      return jsonError("No active attendance record for today.", 404);
    }

    attendance.lastActiveAt = new Date();
    await attendance.save();

    return jsonOk({ lastActiveAt: attendance.lastActiveAt });
  } catch (error) {
    return handleRouteError(error);
  }
}
