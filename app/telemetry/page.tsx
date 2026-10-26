"use client";

import { AppShell } from "@/components/AppShell";
import { useFleet } from "@/lib/store";
import { formatTime } from "@/lib/utils";

export default function TelemetryPage() {
  const { telemetry, devices } = useFleet();
  const latest = devices.map((device) => {
    const sample = telemetry.find((item) => item.deviceId === device.id);
    return { device, sample };
  });

  return (
    <AppShell title="Telemetry" subtitle="Heartbeats from virtual agents and real ESP32 boards.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {latest.map(({ device, sample }) => (
          <article key={device.id} className="rounded-2xl border border-white/8 p-4">
            <p className="font-medium text-white">{device.name}</p>
            <p className="font-mono text-xs text-zinc-500">{device.deviceId}</p>
            {sample ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Stat label="RSSI" value={`${sample.rssi} dBm`} />
                <Stat label="Heap" value={`${Math.round(sample.freeHeap / 1024)} KB`} />
                <Stat label="Uptime" value={`${Math.round(sample.uptimeSec / 60)} m`} />
                <Stat label="Temp" value={sample.temperature ? `${sample.temperature}°C` : "—"} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Waiting for heartbeat.</p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Device</th>
              <th className="px-3 py-2">Firmware</th>
              <th className="px-3 py-2">RSSI</th>
              <th className="px-3 py-2">Heap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {telemetry.slice(0, 40).map((sample) => (
              <tr key={sample.id}>
                <td className="px-3 py-2 text-zinc-400">{formatTime(sample.at)}</td>
                <td className="px-3 py-2">
                  {devices.find((item) => item.id === sample.deviceId)?.name ?? sample.deviceId}
                </td>
                <td className="px-3 py-2 font-mono text-sky-200">{sample.firmware}</td>
                <td className="px-3 py-2">{sample.rssi}</td>
                <td className="px-3 py-2">{sample.freeHeap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/4 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-white">{value}</p>
    </div>
  );
}
