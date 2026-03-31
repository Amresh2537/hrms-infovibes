import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { hashPassword, requireRole } from "@/lib/auth";
import { employeeSchema } from "@/lib/validation";
import Employee from "@/models/Employee";
import User from "@/models/User";

export async function GET() {
  try {
    await requireRole("HR");
    await connectToDatabase();

    const employees = await Employee.find().sort({ createdAt: -1 }).lean();

    return jsonOk({ employees });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("HR");
    const body = await request.json();
    const payload = employeeSchema.parse(body);

    await connectToDatabase();

    const existingEmployee = await Employee.findOne({
      $or: [{ empCode: payload.empCode }, { email: payload.email.toLowerCase() }],
    });

    if (existingEmployee) {
      return jsonError("Employee code or email already exists.", 409);
    }

    const employee = await Employee.create({
      ...payload,
      email: payload.email.toLowerCase(),
      joinDate: new Date(payload.joinDate),
    });

    if (payload.password) {
      await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: await hashPassword(payload.password),
        role: "EMPLOYEE",
        employeeId: employee._id,
      });
    }

    return jsonOk({ employee }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}