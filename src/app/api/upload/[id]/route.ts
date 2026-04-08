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

    const upload = await Upload.findById(id);
    if (!upload) {
      return jsonError("File not found.", 404);
    }

    const fileBytes = Buffer.isBuffer(upload.data)
      ? upload.data
      : Buffer.from(upload.data as Uint8Array);
    const fileName = (upload.originalName || "file").replace(/[\r\n"]/g, "_");
    const body = fileBytes.buffer.slice(
      fileBytes.byteOffset,
      fileBytes.byteOffset + fileBytes.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": upload.mimeType || "application/octet-stream",
        "Content-Length": String(upload.size || fileBytes.length || 0),
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
