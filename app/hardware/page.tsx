"use client";

import { AppShell } from "@/components/AppShell";
import { useFleet } from "@/lib/store";

export default function HardwarePage() {
  const { lastToken } = useFleet();
  const origin =
    typeof window === "undefined" ? "https://your-app.vercel.app" : window.location.origin;

  return (
    <AppShell
      title="ESP32 OTA"
      subtitle="Flash the FirmFlow client, then queue a live deploy of a real .bin."
    >
      <div className="grid max-w-3xl gap-4">
        <section className="rounded-2xl border border-white/10 p-5 text-sm leading-6 text-zinc-400">
          <h2 className="text-base font-medium text-white">1. Register an ESP32</h2>
          <p className="mt-2">
            Devices → Add device → agent = Real ESP32. Copy the token. It is shown once.
          </p>
          {lastToken ? (
            <p className="mt-3 break-all rounded-lg bg-white/5 p-3 font-mono text-xs text-white">
              {lastToken.token}
            </p>
          ) : null}
        </section>
        <section className="rounded-2xl border border-white/10 p-5 text-sm leading-6 text-zinc-400">
          <h2 className="text-base font-medium text-white">2. Flash the sketch</h2>
          <p className="mt-2">
            Open <span className="font-mono text-zinc-200">firmware-esp32/FirmFlowClient</span> in
            Arduino IDE or PlatformIO. Set Wi-Fi, server URL and token:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-sky-100">
{`#define WIFI_SSID     "your-ssid"
#define WIFI_PASSWORD "your-password"
#define FIRMFLOW_URL  "${origin}"
#define DEVICE_TOKEN  "ffd_…"
#define FW_VERSION    "v1.0.0"`}
          </pre>
        </section>
        <section className="rounded-2xl border border-white/10 p-5 text-sm leading-6 text-zinc-400">
          <h2 className="text-base font-medium text-white">3. Deploy a compatible .bin</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Build a newer sketch (bump FW_VERSION) and export the .bin.</li>
            <li>Firmware → Upload release. Platforms = ESP32, min version ≤ current.</li>
            <li>Deployments → Live mode. Only engineers and admins can start live OTA.</li>
            <li>The board authenticates, downloads, SHA-256 verifies, installs, then reports the running version.</li>
            <li>If verify/install fails it stays on the last good build; FirmFlow records the failure and auto-rolls back.</li>
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
