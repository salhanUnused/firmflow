import { startDeployment } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { DeployMode, RecoveryStrategy } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const body = (await request.json()) as {
      firmwareId?: string;
      deviceIds?: string[];
      mode?: DeployMode;
      recovery?: RecoveryStrategy;
      injectFailure?: boolean;
    };
    if (!body.firmwareId || !body.deviceIds?.length) {
      return json({ error: "Firmware and devices are required." }, 400);
    }
    const deployment = await startDeployment(userId, {
      firmwareId: body.firmwareId,
      deviceIds: body.deviceIds,
      mode: body.mode ?? "simulate",
      recovery: body.recovery ?? "auto_rollback",
      injectFailure: body.injectFailure,
    });
    return json({ deployment });
  } catch (error) {
    return fail(error);
  }
}
