import { devicePushLogs } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      entries?: Array<{ level?: "debug" | "info" | "warn" | "error"; message: string }>;
    };
    const result = await devicePushLogs(
      request.headers.get("authorization"),
      body.entries ?? [],
    );
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
