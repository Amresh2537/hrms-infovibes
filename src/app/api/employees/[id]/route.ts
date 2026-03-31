import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { employeeSchema } from "@/lib/validation";
import Employee from "@/models/Employee";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("HR");
    const { id } = await context.params;
    await connectToDatabase();
    const employee = await Employee.findById(id).lean();
    if (!employee) {
      return jsonError("Employee not found.", 404);
    }
    return jsonOk({ employee });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("HR");
    const { id } = await context.params;
    const body = await request.json();
    const payload = employeeSchema.partial().parse(body);

    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {
      ...payload,
      email: payload.email?.toLowerCase(),
      joinDate: payload.joinDate ? new Date(payload.joinDate) : undefined,
      ...(payload.dob ? { dob: new Date(payload.dob) } : {}),
    };

    const employee = await Employee.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!employee) {
      return jsonError("Employee not found.", 404);
    }

    if (payload.email || payload.name) {
      await User.findOneAndUpdate(
        { employeeId: id },
        {
          ...(payload.email ? { email: payload.email.toLowerCase() } : {}),
          ...(payload.name ? { name: payload.name } : {}),
        },
      );
    }

    return jsonOk({ employee });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("HR");
    const { id } = await context.params;

    await connectToDatabase();

    const employee = await Employee.findByIdAndDelete(id).lean();

    if (!employee) {
      return jsonError("Employee not found.", 404);
    }

    await User.deleteOne({ employeeId: id });

    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
