import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("HR");
    const { id } = await context.params;

    const body = await request.json();
    const { newPassword } = body as { newPassword?: string };

    if (!newPassword || typeof newPassword !== "string") {
      return jsonError("New password is required.", 400);
    }

    if (newPassword.length < 8) {
      return jsonError("Password must be at least 8 characters.", 400);
    }

    await connectToDatabase();

    const hashed = await hashPassword(newPassword);

    const user = await User.findOneAndUpdate(
      { employeeId: id },
      { password: hashed },
      { new: true },
    );

    if (!user) {
      return jsonError("No login account found for this employee.", 404);
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
