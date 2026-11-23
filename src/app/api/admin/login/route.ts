import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-cookie";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 400 });
  }

  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch {
    return NextResponse.json(
      { error: "API_URL_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "BACKEND_UNREACHABLE",
        apiUrl,
        detail,
      },
      { status: 503 },
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "INVALID_CREDENTIALS" },
      { status: res.status },
    );
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(ADMIN_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
