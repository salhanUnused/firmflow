"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import type { Device } from "@/types";

export function DeviceTable({
  devices,
  compact = false,
}: {
  devices: Device[];
  compact?: boolean;
}) {
  const router = useRouter();
  const { openWizard } = useFleet();
  const { user } = useAuth();
  const allowDeploy = can(user?.role, "deploy");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {devices.map((device) => (
          <button
            key={device.id}
            type="button"
            className="w-full rounded-lg border border-white/10 bg-[#12151c] p-4 text-left"
            onClick={() => router.push(`/devices/${device.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{device.name}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500">{device.deviceId}</p>
              </div>
              <StatusBadge status={device.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
              <span>{device.platform}</span>
              <span className="font-mono text-zinc-300">{device.firmware}</span>
              <span>{device.lastSeen}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-white/10 md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Device</th>
              {!compact ? <th className="px-4 py-3 font-medium">Device ID</th> : null}
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Firmware</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {!compact ? <th className="px-4 py-3 font-medium">Last seen</th> : null}
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {devices.map((device) => (
              <tr
                key={device.id}
                className="cursor-pointer hover:bg-white/[0.03]"
                onClick={() => router.push(`/devices/${device.id}`)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{device.name}</p>
                  {!compact ? (
                    <p className="text-xs text-zinc-500">{device.location}</p>
                  ) : null}
                </td>
                {!compact ? (
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {device.deviceId}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-zinc-300">{device.platform}</td>
                <td className="px-4 py-3 font-mono text-zinc-200">{device.firmware}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={device.status} />
                </td>
                {!compact ? (
                  <td className="px-4 py-3 text-zinc-400">{device.lastSeen}</td>
                ) : null}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {allowDeploy ? (
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          openWizard({
                            deviceIds: [device.id],
                          });
                        }}
                      >
                        Update
                      </Button>
                    ) : null}
                    <Link
                      href={`/devices/${device.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center px-2 text-xs text-zinc-400 hover:text-white"
                    >
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
