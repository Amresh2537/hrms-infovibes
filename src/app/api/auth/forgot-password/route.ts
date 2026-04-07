import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";
import { handleRouteError, jsonOk } from "@/lib/api";
import { sendPasswordResetEmail } from "@/lib/mailer";
import User from "@/models/User";

const TOKEN_TTL_MS = 30 * 60 * 1000;

function getBaseUrl(request: NextRequest) {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = forgotPasswordSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: payload.email.toLowerCase() });

    // Always return generic success to avoid exposing user existence.
    if (!user) {
      return jsonOk({ message: "If this email is registered, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordTokenHash: tokenHash,
          resetPasswordExpiresAt: expiresAt,
        },
      },
    );

    const resetUrl = `${getBaseUrl(request)}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return jsonOk({ message: "If this email is registered, a reset link has been sent." });
  } catch (error) {
    return handleRouteError(error);
  }
}
