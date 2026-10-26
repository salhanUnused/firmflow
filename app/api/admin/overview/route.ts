import { getPlatformOverview } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";

export async function GET() {
  try {
    const userId = await requireSession();
    const overview = await getPlatformOverview(userId);
    return json({ overview });
  } catch (error) {
    return fail(error);
  }
}
