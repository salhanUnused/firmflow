import { deviceOtaFile } from "@/lib/server/actions";
import { fail } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const { bytes, release } = await deviceOtaFile(request.headers.get("authorization"));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(bytes.length),
        "X-Firmware-Version": release.version,
        "X-Firmware-SHA256": release.sha256,
        "X-Firmware-Signature": release.signature,
        "Content-Disposition": `attachment; filename="${release.fileName}"`,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
