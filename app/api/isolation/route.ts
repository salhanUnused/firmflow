import { isolationProbe } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { deviceId?: string };
    const result = await isolationProbe(userId, body.deviceId ?? "dev-a1");
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
