import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return jsonError("Authentication required.", 401);
    }

    if (error.message === "FORBIDDEN") {
      return jsonError("Access denied.", 403);
    }

    return jsonError(error.message, 400);
  }

  return jsonError("Unexpected server error.", 500);
}