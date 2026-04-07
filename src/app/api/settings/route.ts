import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
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
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = { ...body };

    if (payload.officeLocation && typeof payload.officeLocation === "object") {
      const office = payload.officeLocation as Record<string, unknown>;
      payload.officeLocation = {
        ...office,
        ...(office.lat != null ? { lat: Number(office.lat) } : {}),
        ...(office.lng != null ? { lng: Number(office.lng) } : {}),
        ...(office.radius != null ? { radius: Number(office.radius) } : {}),
      };
    }

    if (Array.isArray(payload.branches)) {
      payload.branches = payload.branches
        .map((branch) => {
          const row = branch as Record<string, unknown>;
          return {
            name: String(row.name ?? "").trim(),
            address: String(row.address ?? "").trim(),
            lat: Number(row.lat),
            lng: Number(row.lng),
            radius: Number(row.radius ?? 500),
          };
        })
        .filter((branch) => branch.name && Number.isFinite(branch.lat) && Number.isFinite(branch.lng) && branch.radius > 0);
    }

    if (!Object.keys(payload).length) {
      return jsonError("No settings payload provided.", 400);
    }

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
