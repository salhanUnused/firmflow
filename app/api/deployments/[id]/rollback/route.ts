import { rollbackDeployment } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireSession();
    const { id } = await context.params;
    const deployment = await rollbackDeployment(userId, id);
    return json({ deployment });
  } catch (error) {
    return fail(error);
  }
}
