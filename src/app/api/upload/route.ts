import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, jsonOk } from "@/lib/api";
import Upload from "@/models/Upload";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return Response.json(
        { error: "Only JPEG, PNG, WebP, and PDF files are allowed." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return Response.json({ error: "File exceeds 5 MB limit." }, { status: 400 });
    }

    const upload = await Upload.create({
      originalName: file.name || "upload.bin",
      mimeType: file.type || "application/octet-stream",
      size: arrayBuffer.byteLength,
      data: Buffer.from(arrayBuffer),
    });

    return jsonOk({ url: `/api/upload/${String(upload._id)}` });
  } catch (error) {
    return handleRouteError(error);
  }
}
