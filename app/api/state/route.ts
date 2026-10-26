import { getStateForUser, tickSimulations } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function GET() {
  try {
    const userId = await requireSession();
    await tickSimulations();
    const data = await getStateForUser(userId);
    return json(data);
  } catch (error) {
    return fail(error);
  }
}
