import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import Leave from "@/models/Leave";

export async function GET(request: NextRequest) {
  try {
    await requireRole("HR");
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "";

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    const leaves = await Leave.find(query)
      .populate("employeeId", "name empCode department")
      .sort({ createdAt: -1 })
      .lean();

    return jsonOk({ leaves });
  } catch (error) {
    return handleRouteError(error);
  }
}
