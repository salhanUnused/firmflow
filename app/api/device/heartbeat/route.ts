import { deviceHeartbeat } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await deviceHeartbeat(request.headers.get("authorization"), body);
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
