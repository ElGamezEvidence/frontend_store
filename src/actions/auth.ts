"use server";

import { redirect } from "next/navigation";

/** Logout via route handler (clears httpOnly cookie). */
export async function logoutAction(): Promise<void> {
  redirect("/api/admin/logout");
}
