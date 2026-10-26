import { cookies } from "next/headers";
import { hmacSign, hmacVerify, sessionSecret } from "@/lib/server/crypto";

const COOKIE = "firmflow_session";

export function encodeSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, t: Date.now() })).toString(
    "base64url",
  );
  const sig = hmacSign(payload, sessionSecret());
  return `${payload}.${sig}`;
}

export function decodeSession(token: string | undefined | null) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!hmacVerify(payload, sig, sessionSecret())) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      userId?: string;
    };
    return parsed.userId ?? null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSessionUserId() {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}
