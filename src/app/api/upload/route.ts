import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Sanitize filename: keep only alphanumeric, dash, underscore, dot
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();

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

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".bin";
    const safeName = `${Date.now()}-${sanitizeFilename(path.basename(file.name, ext))}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, Buffer.from(arrayBuffer));

    return jsonOk({ url: `/uploads/${safeName}` });
  } catch (error) {
    return handleRouteError(error);
  }
}
