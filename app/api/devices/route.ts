import { registerDevice } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { DeviceAgent, Platform } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as {
      name?: string;
      platform?: Platform;
      projectId?: string;
      location?: string;
      hardwareRevision?: string;
      agent?: DeviceAgent;
    };
    if (!body.name || !body.platform) {
      return json({ error: "Name and platform are required." }, 400);
    }
    const result = await registerDevice(userId, {
      name: body.name,
      platform: body.platform,
      projectId: body.projectId,
      location: body.location,
      hardwareRevision: body.hardwareRevision,
      agent: body.agent,
    });
    return json(result);
  } catch (error) {
    return fail(error);
  }
}
