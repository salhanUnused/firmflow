import { changePlan } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { PlanId } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as { plan?: PlanId };
    if (!body.plan) return json({ error: "Plan is required." }, 400);
    const org = await changePlan(userId, body.plan);
    return json({ org });
  } catch (error) {
    return fail(error);
  }
}
