import { NextResponse } from "next/server";
import { EntitlementError } from "@/lib/plans";
import { ForbiddenError } from "@/lib/roles";
import { ApiError } from "@/lib/server/actions";
import { readSessionUserId } from "@/lib/server/session";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof ForbiddenError) return json({ error: error.message }, 403);
  if (error instanceof EntitlementError) return json({ error: error.message, code: "ENTITLEMENT" }, 402);
  const message = error instanceof Error ? error.message : "Unexpected error";
  return json({ error: message }, 500);
}

export async function requireSession() {
  const userId = await readSessionUserId();
  if (!userId) throw new ApiError(401, "Sign in required.");
  return userId;
}
