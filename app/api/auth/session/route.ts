import { getStateForUser } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";
import { readSessionUserId } from "@/lib/server/session";

export async function GET() {
  try {
    const userId = await readSessionUserId();
    if (!userId) return json({ user: null }, 200);
    const data = await getStateForUser(userId);
    return json(data);
  } catch (error) {
    return fail(error);
  }
}
