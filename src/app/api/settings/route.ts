import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await requireRole("HR");
    await connectToDatabase();

    let settings = await Settings.findOne({ singleton: "global" }).lean();

    if (!settings) {
      settings = await Settings.create({ singleton: "global" });
    }

    return jsonOk({ settings });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole("HR");
    const body = await request.json();
    // Accept partial updates — each settings section sends only its own fields
    const payload = settingsSchema.partial().parse(body);

    await connectToDatabase();

    const settings = await Settings.findOneAndUpdate(
      { singleton: "global" },
      { $set: payload },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return jsonOk({ settings });
  } catch (error) {
    return handleRouteError(error);
  }
}
