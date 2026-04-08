import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { endOfDay, startOfDay } from "@/lib/date";
import { attendanceCheckOutSchema } from "@/lib/validation";
import Attendance from "@/models/Attendance";

const MIN_CHECKOUT_DELAY_MINUTES = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json().catch(() => ({}));
    const payload = attendanceCheckOutSchema.parse(body);

    if (!session.employeeId) {
      return jsonError("Employee profile is not linked to this account.", 400);
    }

    await connectToDatabase();

    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const attendance = await Attendance.findOne({
      employeeId: session.employeeId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!attendance?.checkInTime) {
      return jsonError("Check-in is required before check-out.", 400);
    }

    if (attendance.checkOutTime) {
      return jsonError("Check-out has already been recorded for today.", 409);
    }

    const elapsedMs = Date.now() - new Date(attendance.checkInTime).getTime();
    const minAllowedMs = MIN_CHECKOUT_DELAY_MINUTES * 60 * 1000;
    if (elapsedMs < minAllowedMs) {
      return jsonError(
        `You can check out only after ${MIN_CHECKOUT_DELAY_MINUTES} minutes from check-in.`,
        400,
      );
    }

    attendance.checkOutTime = new Date();
    if (payload.selfieUrl) attendance.checkOutSelfieUrl = payload.selfieUrl;
    await attendance.save();

    return jsonOk({ attendance });
  } catch (error) {
    return handleRouteError(error);
  }
}