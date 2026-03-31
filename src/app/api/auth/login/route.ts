import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { comparePassword, setAuthCookie, signAuthToken } from "@/lib/auth";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      return jsonError("Invalid credentials.", 401);
    }

    const isValid = await comparePassword(payload.password, user.password);

    if (!isValid) {
      return jsonError("Invalid credentials.", 401);
    }

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
    });

    return setAuthCookie(response, token);
  } catch (error) {
    return handleRouteError(error);
  }
}