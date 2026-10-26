import { platformChangePlan } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { PlanId } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { orgId?: string; plan?: PlanId };
    if (!body.orgId || !body.plan) {
      return json({ error: "Organization and plan are required." }, 400);
    }
    const org = await platformChangePlan(userId, body.orgId, body.plan);
    return json({ org });
  } catch (error) {
    return fail(error);
  }
}
