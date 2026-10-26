import { acknowledgeAlert, upsertAlertRule } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = await request.json();
    const rule = await upsertAlertRule(userId, body);
    return json({ rule });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { alertId?: string };
    if (!body.alertId) return json({ error: "Alert id is required." }, 400);
    const alert = await acknowledgeAlert(userId, body.alertId);
    return json({ alert });
  } catch (error) {
    return fail(error);
  }
}
