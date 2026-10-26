import { signUpPlatformAdmin } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const actorId = await requireSession();
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };
    if (!body.fullName || !body.email || !body.password) {
      return json({ error: "Name, email and password are required." }, 400);
    }
    const user = await signUpPlatformAdmin(
      {
        fullName: body.fullName,
        email: body.email,
        password: body.password,
      },
      actorId,
    );
    return json({
      operator: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
