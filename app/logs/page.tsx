"use client";

import { AppShell } from "@/components/AppShell";
import { useFleet } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  const { logs, devices } = useFleet();

  return (
    <AppShell title="Device logs" subtitle="Install, verify and recovery messages from the fleet.">
      <div className="overflow-hidden rounded-lg border border-white/10">
        <ul className="divide-y divide-white/8">
          {logs.length === 0 ? (
            <li className="p-5 text-sm text-zinc-500">No logs yet. Register a virtual device or flash an ESP32.</li>
          ) : (
            logs.map((entry) => (
              <li key={entry.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-zinc-500">{formatTime(entry.at)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 uppercase tracking-wider",
                      entry.level === "error"
                        ? "bg-rose-400/10 text-rose-300"
                        : entry.level === "warn"
                          ? "bg-amber-400/10 text-amber-200"
                          : "bg-white/5 text-zinc-400",
                    )}
                  >
                    {entry.level}
                  </span>
                  <span className="text-zinc-400">
                    {devices.find((item) => item.id === entry.deviceId)?.name ?? entry.deviceId}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white">{entry.message}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </AppShell>
  );
}
