import { signUpPlatformAdmin } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";
import { readSessionUserId, setSessionCookie } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      orgName?: string;
      inviteSecret?: string;
    };
    if (!body.fullName || !body.email || !body.password) {
      return json({ error: "Name, email and password are required." }, 400);
    }
    const actorId = await readSessionUserId();
    const user = await signUpPlatformAdmin(
      {
        fullName: body.fullName,
        email: body.email,
        password: body.password,
        orgName: body.orgName,
        inviteSecret: body.inviteSecret,
      },
      actorId,
    );
    await setSessionCookie(user.id);
    return json({ user });
  } catch (error) {
    return fail(error);
  }
}
