import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { leaveSchema } from "@/lib/validation";
import Employee from "@/models/Employee";
import Leave from "@/models/Leave";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const payload = leaveSchema.parse(body);

    if (!session.employeeId) {
      return jsonError("Employee profile is not linked to this account.", 400);
    }

    await connectToDatabase();

    const employee = await Employee.findById(session.employeeId).lean();

    if (!employee) {
      return jsonError("Employee not found.", 404);
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      ...payload,
      fromDate: new Date(payload.fromDate),
      toDate: new Date(payload.toDate),
    });

    return jsonOk({ leave }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}