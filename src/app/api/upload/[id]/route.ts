import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonError } from "@/lib/api";
import Upload from "@/models/Upload";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return jsonError("File not found.", 404);
    }

    await connectToDatabase();

    const upload = await Upload.findById(id).lean();
    if (!upload) {
      return jsonError("File not found.", 404);
    }

    const fileName = (upload.originalName || "file").replace(/[\r\n"]/g, "_");

    return new Response(upload.data, {
      status: 200,
      headers: {
        "Content-Type": upload.mimeType || "application/octet-stream",
        "Content-Length": String(upload.size || upload.data.length || 0),
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
