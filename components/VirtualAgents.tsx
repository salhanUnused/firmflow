"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { seedTokenFor, useFleet } from "@/lib/store";

async function sha256Hex(buffer: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function VirtualAgents() {
  const { user } = useAuth();
  const { devices, tokens } = useFleet();

  useEffect(() => {
    if (!user) return;
    const virtuals = devices.filter((device) => device.agent === "virtual");
    if (virtuals.length === 0) return;

    let cancelled = false;

    const tick = async () => {
      for (const device of virtuals) {
        if (cancelled) return;
        const token = tokens[device.id] || seedTokenFor(device.id);
        const headers = { Authorization: `Bearer ${token}` };
        try {
          await fetch("/api/device/heartbeat", {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              firmware: device.firmware,
              rssi: -45 - Math.round(Math.random() * 25),
              uptimeSec: Math.round(performance.now() / 1000),
              freeHeap: 90_000 + Math.round(Math.random() * 40_000),
              temperature: 24 + Math.round(Math.random() * 8),
            }),
          });
          const ota = await fetch("/api/device/ota", { headers });
          const manifest = (await ota.json()) as {
            update?: boolean;
            version?: string;
            sha256?: string;
            url?: string;
          };
          if (!manifest.update || !manifest.url) continue;
          const file = await fetch(manifest.url, { headers });
          const bytes = await file.arrayBuffer();
          const digest = await sha256Hex(bytes);
          const ok = digest === manifest.sha256;
          await fetch("/api/device/ota/result", {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              ok,
              version: manifest.version,
              sha256: digest,
              error: ok ? undefined : "SHA-256 mismatch",
            }),
          });
          await fetch("/api/device/logs", {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              entries: [
                {
                  level: ok ? "info" : "error",
                  message: ok
                    ? `Virtual agent installed ${manifest.version}`
                    : "Virtual agent rejected binary",
                },
              ],
            }),
          });
        } catch {
          // agent keeps polling
        }
      }
    };

    void tick();
    const timer = window.setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, devices, tokens]);

  return null;
}
