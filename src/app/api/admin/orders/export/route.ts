import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { getAdminToken } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const incoming = request.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ["status", "q", "pendingTajir"] as const) {
    const value = incoming.get(key);
    if (value) qs.set(key, value);
  }

  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch {
    return NextResponse.json({ error: "API_URL_NOT_CONFIGURED" }, { status: 500 });
  }

  const res = await fetch(`${apiUrl}/api/orders/export/excel?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });


  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: text || "EXPORT_FAILED" },
      { status: res.status },
    );
  }

  const buffer = await res.arrayBuffer();
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders_export_${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
