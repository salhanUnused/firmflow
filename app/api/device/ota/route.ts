import { deviceOtaCheck } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const result = await deviceOtaCheck(request.headers.get("authorization"), origin);
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
