import { handleRouteError, jsonOk } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getAttendanceRules } from "@/lib/attendance-rules";

export async function GET() {
  try {
    await requireSession(); // any logged-in user (employee or HR)
    const rules = await getAttendanceRules();
    return jsonOk({ rules });
  } catch (error) {
    return handleRouteError(error);
  }
}
