import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = resetPasswordSchema.parse(body);

    const tokenHash = crypto.createHash("sha256").update(payload.token).digest("hex");

    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return jsonError("Reset link is invalid or expired.", 400);
    }

    const password = await hashPassword(payload.newPassword);

    await User.updateOne(
      { _id: user._id },
      {
        $set: { password },
        $unset: {
          resetPasswordTokenHash: "",
          resetPasswordExpiresAt: "",
        },
      },
    );

    return jsonOk({ message: "Password has been reset successfully." });
  } catch (error) {
    return handleRouteError(error);
  }
}
