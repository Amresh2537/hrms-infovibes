import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { hashPassword, setAuthCookie, signAuthToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    await connectToDatabase();

    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

    if (existingUser) {
      return jsonError("A user with this email already exists.", 409);
    }

    const password = await hashPassword(payload.password);
    const user = await User.create({
      ...payload,
      email: payload.email.toLowerCase(),
      password,
    });

    const token = await signAuthToken({
      userId: user._id.toString(),
      employeeId: user.employeeId?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = jsonOk({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 201);

    return setAuthCookie(response, token);
  } catch (error) {
    return handleRouteError(error);
  }
}