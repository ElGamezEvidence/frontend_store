import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "ghazala_admin_token";

export async function getAdminToken() {
  const jar = await cookies();
  return jar.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}
