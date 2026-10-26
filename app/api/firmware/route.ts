import { createFirmwareRelease } from "@/lib/server/actions";
import { fail, json, requireSession } from "@/lib/server/http";
import type { FirmwareChannel, Platform } from "@/types";

export async function POST(request: Request) {
  try {
    const userId = await requireSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Upload a firmware binary." }, 400);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const platforms = String(form.get("platforms") ?? "ESP32")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean) as Platform[];
    const hardwareRevisions = String(form.get("hardwareRevisions") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const release = await createFirmwareRelease(userId, {
      version: String(form.get("version") ?? ""),
      description: String(form.get("description") ?? ""),
      channel: (String(form.get("channel") ?? "beta") as FirmwareChannel),
      projectId: String(form.get("projectId") ?? "") || undefined,
      platforms,
      minVersion: String(form.get("minVersion") ?? "") || undefined,
      hardwareRevisions,
      fileName: file.name,
      bytes,
    });
    return json({ release });
  } catch (error) {
    return fail(error);
  }
}
