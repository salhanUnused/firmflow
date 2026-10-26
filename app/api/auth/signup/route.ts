import { signUpUser } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      orgName?: string;
      projectName?: string;
    };
    if (!body.fullName || !body.email || !body.password || !body.orgName) {
      return json({ error: "Name, email, password and workspace are required." }, 400);
    }
    const user = await signUpUser({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      orgName: body.orgName,
      projectName: body.projectName || "Production",
    });
    await setSessionCookie(user.id);
    return json({ user });
  } catch (error) {
    return fail(error);
  }
}
