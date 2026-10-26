"use client";

import Link from "next/link";
import { Activity, Cpu, Radio, WifiOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { DeviceTable } from "@/components/DeviceTable";
import { DeploymentBadge } from "@/components/StatusBadge";
import { useFleet } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { stats, firmware, deployments, devices, org, activities } = useFleet();
  const { user } = useAuth();
  const totalFirmware = firmware.reduce((sum, item) => sum + item.deviceCount, 0) || 1;

  return (
    <AppShell
      title="Fleet overview"
      subtitle={`${org?.name ?? "Workspace"} · ${user?.role ?? "member"} · ${org?.plan ?? ""}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Devices" value={stats.total} icon={Radio} accent="blue" />
        <StatCard label="Online" value={stats.online} icon={Activity} accent="green" />
        <StatCard label="Updating" value={stats.updating} icon={Cpu} accent="cyan" />
        <StatCard label="Offline" value={stats.offline} icon={WifiOff} accent="slate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Firmware distribution</h2>
            <span className="text-xs text-slate-500">{stats.total} devices</span>
          </div>
          <div className="space-y-4">
            {firmware.map((release) => {
              const pct = Math.round((release.deviceCount / totalFirmware) * 100);
              return (
                <div key={release.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-mono text-sky-200">{release.version}</span>
                    <span className="text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="progress-bar h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 p-5">
          <h2 className="mb-4 font-medium">Today in the field</h2>
          <ul className="space-y-4">
            {activities.map((item) => (
              <li key={item.id} className="border-b border-white/8 pb-3 last:border-0 last:pb-0">
                <p className="font-mono text-[11px] text-zinc-500">{item.time}</p>
                <p className="mt-1 text-sm text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 p-5">
        <h2 className="mb-4 font-medium">Device health</h2>
        <HealthBar stats={stats} />
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <HealthItem label="Online" value={stats.online} color="bg-emerald-400" />
          <HealthItem label="Updating" value={stats.updating} color="bg-sky-400" />
          <HealthItem label="Offline" value={stats.offline} color="bg-slate-400" />
          <HealthItem label="Error" value={stats.error} color="bg-rose-400" />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Recent deployments</h2>
          <Link href="/deployments" className="text-sm text-sky-300 hover:text-sky-200">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Firmware</th>
                <th className="pb-3 font-medium">Devices</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {deployments.slice(0, 5).map((deployment) => (
                <tr key={deployment.id}>
                  <td className="py-3 font-mono text-sky-200">
                    <Link href={`/deployments/${deployment.id}`}>
                      {deployment.firmwareVersion}
                    </Link>
                  </td>
                  <td className="py-3">{deployment.deviceCount}</td>
                  <td className="py-3">
                    <DeploymentBadge status={deployment.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="progress-bar h-full"
                          style={{ width: `${deployment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{deployment.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{formatTime(deployment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Watched devices</h2>
          <Link href="/devices" className="text-sm text-sky-300 hover:text-sky-200">
            Open devices
          </Link>
        </div>
        <DeviceTable devices={devices.slice(0, 5)} compact />
      </section>
    </AppShell>
  );
}

function HealthBar({
  stats,
}: {
  stats: { total: number; online: number; updating: number; offline: number; error: number };
}) {
  const total = Math.max(1, stats.total);
  const parts = [
    { value: stats.online, className: "bg-emerald-400" },
    { value: stats.updating, className: "bg-sky-400" },
    { value: stats.offline, className: "bg-slate-500" },
    { value: stats.error, className: "bg-rose-400" },
  ];

  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-white/8">
      {parts.map((part, index) => (
        <div
          key={index}
          className={part.className}
          style={{ width: `${(part.value / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

function HealthItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2">
      <span className="flex items-center gap-2 text-slate-300">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
