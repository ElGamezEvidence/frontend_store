import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth-cookie";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  // Prefer a data URL already compressed by the client.
  const dataUrl = form.get("dataUrl");
  if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
    if (dataUrl.length > 5_500_000) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }
    return NextResponse.json({ url: dataUrl });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const url = `data:${file.type};base64,${base64}`;
  if (url.length > 5_500_000) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  return NextResponse.json({ url });
}
