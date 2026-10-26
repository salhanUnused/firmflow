import { deviceOtaResult } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ok?: boolean;
      version?: string;
      sha256?: string;
      error?: string;
    };
    const result = await deviceOtaResult(request.headers.get("authorization"), {
      ok: Boolean(body.ok),
      version: body.version,
      sha256: body.sha256,
      error: body.error,
    });
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
