"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-cookie";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const data = (await res.json()) as { token: string };
  const jar = await cookies();
  jar.set(ADMIN_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_TOKEN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/admin/login");
}
