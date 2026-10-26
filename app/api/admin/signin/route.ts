import { signInPlatformAdmin } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return json({ error: "Email and password are required." }, 400);
    }
    const user = await signInPlatformAdmin(body.email, body.password);
    await setSessionCookie(user.id);
    return json({ user });
  } catch (error) {
    return fail(error);
  }
}
